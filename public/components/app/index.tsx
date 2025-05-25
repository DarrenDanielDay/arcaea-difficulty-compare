import { useState, useEffect } from "preact/hooks";
import { MERGE_SORT } from "../../core/algorithms/merge-sort";
import { Entity } from "../../core/models";
import { CompareTaskInit } from "../../core/task";
import { useStore } from "../../hooks/use-store";
import { CompareTask } from "../task";
import { PublicInterfaces } from "../../core/interfaces";
import { useATBService } from "../../hooks/use-atb-service";
import { CompareChart, ConstantRange } from "../../services/chart-data";
import { formatDateTime } from "../../utils/misc";
import { ConstantRangeSelect } from "../constant-range-select";
import { Title } from "../title";
import { SavesList } from "../saves";

interface AppProps {
  impls: PublicInterfaces<CompareChart>;
}

export const App = ({ impls }: AppProps) => {
  const store = useStore(impls);
  const atb = useATBService();
  const [taskInit, _setTaskInit] = useState<CompareTaskInit<CompareChart> | null>(null);
  const setTaskInit = (init: CompareTaskInit<CompareChart>) => {
    _setTaskInit(null);
    setTimeout(() => {
      _setTaskInit(init);
    }, 100);
  };

  const createNewCompare = async (range: ConstantRange) => {
    const now = `${range.min.toFixed(1)}~${range.max.toFixed(1)}, ${formatDateTime(new Date())}`;
    const charts = await atb.chartData.pickChartsInRange(range);
    const entities = await Promise.all(
      charts.map(async (c) => ({ id: c.chart.id, data: await atb.chartData.create(c.chart.id) }))
    );
    setTaskInit({
      id: now,
      choices: [],
      entities,
      algorithm: MERGE_SORT,
    });
  };

  return (
    <div class="app">
      <Title title="保存的进度" />
      <div class="m-3">
        <SavesList store={store} onSelect={setTaskInit} />
      </div>
      <Title title="难度比较"></Title>
      {!taskInit && <div class="m-3 small">请选择官谱的定数范围来确定比较的谱面的范围。</div>}
      <div class="m-3">
        <ConstantRangeSelect disabled={taskInit != null} onSubmit={createNewCompare} submitText="开始" />
      </div>
      {taskInit && (
        <div class="m-3">
          <div class="d-flex align-items-center">
            <div class="flex-fill">{taskInit.id}</div>
            <div>
              <button class="btn btn-secondary" onClick={() => _setTaskInit(null)}>
                关闭存档
              </button>
            </div>
          </div>
          <CompareTask store={store} taskInit={taskInit} renderEntity={impls.renderer.render} />
        </div>
      )}
    </div>
  );
};
