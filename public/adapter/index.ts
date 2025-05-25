import { h } from "preact";
import { impl } from "../core/interfaces";
import { ChartDataService, CompareChart } from "../services/chart-data";
import { ChartDisplay } from "../components/chart-display";

const atb = new ChartDataService();

export const impls = impl<CompareChart>(atb, {
  render(entity) {
    return h(ChartDisplay, { cc: entity });
  },
});
