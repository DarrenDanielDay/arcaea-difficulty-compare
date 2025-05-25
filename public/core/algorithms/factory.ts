import { CompareSortAlgorithm } from "../models";
import { MergeSort } from "./merge-sort";

const knownAlgorithms = [new MergeSort()];

export function createAlgorithm(name: string): CompareSortAlgorithm {
  const instance = knownAlgorithms.find((a) => a.name === name);
  if (!instance) {
    throw new Error(`Unknown algorithm name: ${name}`);
  }
  return instance;
}
