import type { Chart, SongData } from "@arcaea-toolbelt/models/music-play";
import { EntityFactory } from "../core/interfaces";
import { indexBy } from "../utils/misc";

export interface ConstantRange {
  min: number;
  max: number;
}

export interface CompareChart {
  jacket: string;
  song: SongData;
  chart: Chart;
}
export interface ChartIndex {
  [chartId: string]: CompareChart;
}

export class ChartDataService implements EntityFactory<CompareChart> {
  #cache: Promise<SongData[]> | null = null;
  #index: Promise<ChartIndex> | null = null;

  #getSongIndex() {
    return (this.#index ??= (async () => {
      const songs = await this.getSongData();
      return indexBy(
        songs.flatMap<CompareChart>((song) =>
          song.charts.map<CompareChart>((chart) => ({
            chart,
            song,
            jacket: `https://assets.yurisaki.top/arcaea/jacket/${song.id}/${ratingClass(chart.difficulty)}`,
          }))
        ),
        (c) => c.chart.id
      );
    })());
  }

  private async fetchChartData(): Promise<SongData[]> {
    const response = await fetch(new URL("chart-data.json", process.env.ARCAEA_TOOLBELT_DATA));
    return response.json();
  }

  getSongData() {
    return (this.#cache ??= this.fetchChartData());
  }

  async pickChartsInRange(range: ConstantRange) {
    const songs = await this.#getSongIndex();
    return Object.values(songs)
      .filter((chart) => range.min <= chart.chart.constant && chart.chart.constant <= range.max)
      .sort((a, b) => a.chart.constant - b.chart.constant);
  }

  async create(id: string): Promise<CompareChart> {
    const index = await this.#getSongIndex();
    return index[id]!;
  }
}

export function ratingClass(difficulty: string) {
  return ["pst", "prs", "ftr", "byd", "etr"].indexOf(difficulty);
}