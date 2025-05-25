import { CompareAlgorithmProgress, CompareSortAlgorithm, Choice } from "../models";

export const MERGE_SORT = "merge-sort";

export class MergeSort implements CompareSortAlgorithm {
  name = MERGE_SORT;
  start(init: string[]): CompareAlgorithmProgress {
    const workspace = structuredClone(init);
    function* sort(begin: number, end: number): CompareAlgorithmProgress {
      if (end - begin <= 1) {
        return workspace.slice(begin, end);
      }
      const middle = Math.floor((begin + end) / 2);
      const leftPart = yield* sort(begin, middle);
      const rightPart = yield* sort(middle, end);
      let leftI = 0;
      let rightI = 0;
      const mergeResult: string[] = [];
      while (leftI < leftPart.length && rightI < rightPart.length) {
        const left = leftPart[leftI]!;
        const right = rightPart[rightI]!;
        const relation = yield { left, right };
        switch (relation) {
          case Choice.GreaterThan:
            /* left > right */
            mergeResult.push(right);
            rightI++;
            break;
          case Choice.LessThan:
            /* left < right */
            mergeResult.push(left);
            leftI++;
            break;
          case Choice.ExcludeLeft:
            leftI++;
            break;
          case Choice.ExcludeRight:
            rightI++;
            break;
          default:
            /* ? */
            throw new Error(`Unexpected relation: ${relation}`);
        }
      }
      const fillRange = leftI >= leftPart.length ? rightPart.slice(rightI) : leftPart.slice(leftI);
      for (const rest of fillRange) {
        mergeResult.push(rest);
      }
      return mergeResult;
    }
    return sort(0, workspace.length);
  }

  worst(init: string[], choices: Choice[]): number {
    let choiceI = 0;
    function worst(begin: number, end: number): { partLength: number; cost: number } {
      if (end - begin <= 1) {
        return { partLength: end - begin, cost: 0 };
      }
      const middle = Math.floor((begin + end) / 2);
      const left = worst(begin, middle);
      const right = worst(middle, end);
      // Merge
      let leftI = 0;
      let rightI = 0;
      let merged = 0;
      Loop: while (leftI < left.partLength && rightI < right.partLength) {
        if (choiceI >= choices.length) {
          break;
        }
        const relation = choices[choiceI];
        choiceI++;
        switch (relation) {
          case Choice.GreaterThan:
            /* left > right */
            merged++;
            rightI++;
            break;
          case Choice.LessThan:
            /* left < right */
            merged++;
            leftI++;
            break;
          case Choice.ExcludeLeft:
            leftI++;
            break;
          case Choice.ExcludeRight:
            rightI++;
            break;
          default:
            /* ? */
            break Loop;
        }
      }
      const leftRest = left.partLength - leftI;
      const rightRest = right.partLength - rightI;
      const result = {
        cost: left.cost + right.cost + leftRest + rightRest - 1,
        partLength: merged + leftRest + rightRest,
      };
      return result;
    }
    return worst(0, init.length).cost;
  }
}
