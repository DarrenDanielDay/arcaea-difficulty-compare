import { FunctionComponent as FC } from "preact";
import { CompareChart } from "../../services/chart-data";

export interface JacketProp extends CompareChart {}

export const Jacket: FC<JacketProp> = ({ chart, jacket, song }) => {
  return (
    <img
      crossOrigin="anonymous"
      src={jacket}
      alt={chart.override?.name ?? song.name}
      class={`jacket border-${chart.difficulty}`}
    />
  );
};
