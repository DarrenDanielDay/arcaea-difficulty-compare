import "./style.css";
import { FunctionComponent as FC } from "preact";
import { CompareChart } from "../../services/chart-data";
import { Jacket } from "../jacket";

export interface ChartDisplayProp {
  cc: CompareChart;
}

export const ChartDisplay: FC<ChartDisplayProp> = ({ cc: { chart, song, jacket } }) => {
  return (
    <div class="chart-display d-flex flex-column align-items-center">
      <Jacket chart={chart} jacket={jacket} song={song} />
      <div class={`difficulty difficulty-${chart.difficulty}`}>
        [{chart.difficulty.toUpperCase()}] {chart.level}
        {chart.plus && "+"}
      </div>
      <div class="song-title">{song.name}</div>
    </div>
  );
};
