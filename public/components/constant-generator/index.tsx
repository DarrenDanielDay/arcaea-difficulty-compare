import { FunctionComponent as FC } from "preact";
import { CompareConclusion, Entity } from "../../core/models";
import { CompareChart, ConstantRange } from "../../services/chart-data";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ConstantRangeSelect } from "../constant-range-select";
import { Title } from "../title";
import { ExportFile, MemoryFile } from "../export";
import html2canvas from "html2canvas";
import { Jacket } from "../jacket";

export interface ConstantGeneratorProp {
  conclusion: CompareConclusion<CompareChart>;
}

interface ChartTableItem {
  entity: Entity<CompareChart>;
  constant: number;
}

interface ChartGroup {
  floor: string;
  out?: boolean;
  items: ChartTableItem[];
}

const ChartTableItemDisplay = ({
  item: {
    entity: { data },
    constant,
  },
  old,
}: {
  item: ChartTableItem;
  old?: boolean;
}) => {
  return (
    <div class="mx-1 d-flex flex-column align-items-center">
      <Jacket {...data} />
      <div>{old ? `${constant}(old)` : constant.toFixed(2)}</div>
    </div>
  );
};

function linearMap(distMin: number, distMax: number, srcMin: number, srcMax: number, x: number) {
  return ((x - srcMin) * (distMax - distMin)) / (srcMax - srcMin) + distMin;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function colorToRgb(color: string) {
  const hex = parseInt(color.slice(1), 16);
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function linearColorMap(colorA: string, colorB: string, min: number, max: number, x: number) {
  const [r1, g1, b1] = colorToRgb(colorA);
  const [r2, g2, b2] = colorToRgb(colorB);
  const r = Math.round(linearMap(r1, r2, min, max, x));
  const g = Math.round(linearMap(g1, g2, min, max, x));
  const b = Math.round(linearMap(b1, b2, min, max, x));
  const hex = rgbToHex(r, g, b);
  console.log(hex);
  return hex;
}

function colorPointInterpolation(colors: string[], min: number, max: number, x: number) {
  const step = (max - min) / (colors.length - 1);
  if (x === min) {
    return colors[0];
  }
  if (x === max) {
    return colors[colors.length - 1];
  }
  const round = (x - min) / step;
  const index = Math.floor(round);
  if (round === index) {
    return colors[index];
  }
  return linearColorMap(
    colors[index],
    colors[index + 1],
    min + step * index,
    min + step * (index + 1),
    x
  );
}

export const ConstantGenerator: FC<ConstantGeneratorProp> = ({ conclusion: { excluded, ordered } }) => {
  const [range, setRange] = useState<ConstantRange | null>(null);
  const groups = useMemo(() => {
    if (range == null) {
      return null;
    }
    const diffrence = range.max - range.min;
    const step = diffrence / Math.max(1, ordered.length - 1);
    const items = ordered.map<ChartTableItem>((entity, i) => ({
      entity,
      constant: range.min + step * i,
    }));
    let currentFloor = -Infinity;

    const groups: ChartGroup[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const floor = Math.floor(item.constant * 10);
      if (floor > currentFloor) {
        currentFloor = floor;
        groups.push({ floor: (floor / 10).toFixed(1), items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }
    groups.push({
      floor: "论外",
      out: true,
      items: excluded.map((entity) => ({ entity, constant: entity.data.chart.constant })),
    });
    console.log(groups);
    return groups;
  }, [range, ordered, excluded]);
  const tableRef = useRef<HTMLTableElement>(null);
  const exportTableImage = async () => {
    if (tableRef.current == null || range == null) {
      throw new Error("nullptr");
    }
    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: 2,
    });
    return new Promise<MemoryFile>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob == null) {
          reject(new Error("canvas toBlob failed"));
          return;
        }
        resolve({
          blob,
          filename: `${range.min.toFixed(1)}~${range.max.toFixed(1)}.png`,
        });
      });
    });
  };
  return (
    <div>
      <div class="m-2 small">
        选择期望的定数范围以生成定数表。定数将以<mark>均匀分布</mark>生成。
      </div>
      <ConstantRangeSelect disabled={false} onSubmit={setRange} />
      {groups && (
        <>
          <Title title="生成的定数表" />
          <ExportFile getFile={exportTableImage} exportText="导出定数表图片" linkText="点击下载图片" />
          <div class="m-3"></div>
          <table ref={tableRef}>
            <tbody>
              {groups.map((group, i) => (
                <tr key={i}>
                  <td
                    class="text-center px-2"
                    style={{
                      backgroundColor: group.out
                        ? "#cccccc"
                        : colorPointInterpolation(["#55ff55", "#ffff55", "#ff5555"], 0, groups.length - 2, i),
                    }}
                  >
                    {group.floor}
                  </td>
                  <td key={i} class="d-flex align-items-center flex-wrap">
                    {group.items.map((item) => (
                      <ChartTableItemDisplay key={item.entity.id} item={item} />
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};
