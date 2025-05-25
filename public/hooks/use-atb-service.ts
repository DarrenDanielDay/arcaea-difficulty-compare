import { useState } from "preact/hooks";
import { ChartDataService } from "../services/chart-data";

export const useATBService = () => {
  const [atbService] = useState(() => {
    return {
      chartData: new ChartDataService(),
    };
  });
  return atbService;
};
