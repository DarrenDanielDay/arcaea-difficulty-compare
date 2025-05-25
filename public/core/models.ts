export interface Entity<T> {
  id: string;
  data: T;
}

export enum Choice {
  ExcludeLeft = -2,
  LessThan = -1,
  GreaterThan = 1,
  ExcludeRight = 2,
}

interface DetailedChoiceBase {
  /**
   * id of left
   */
  left: string;
  /**
   * id of right
   */
  right: string;
  choice: Choice;
}

export enum UserChoiceType {
  Compare,
  Exclude,
}

export interface ComparisonChoice extends DetailedChoiceBase {
  type: UserChoiceType.Compare;
}

export interface ExcludeChoice extends DetailedChoiceBase {
  type: UserChoiceType.Exclude;
  id: string;
}

export type DetailedChoice = ComparisonChoice | ExcludeChoice;

export interface Comparison {
  left: string;
  right: string;
}

export interface EntityComparison<T> {
  left: Entity<T>;
  right: Entity<T>;
}

export interface CompareSortAlgorithm {
  name: string;
  /**
   * @param init array of id
   */
  start(init: string[]): CompareAlgorithmProgress;
  worst(init: string[], choices: Choice[]): number;
}

export type CompareAlgorithmProgress = Generator<Comparison, string[], Choice>;

export type CompareAlgorithmProgressStatus = IteratorResult<Comparison, string[]>;

export interface ExcludeStatus {
  canExclude: {
    left: boolean;
    right: boolean;
  };
}

export interface CompareConclusion<T> {
  ordered: Entity<T>[];
  excluded: Entity<T>[];
}

export type CompareTaskStatus<T> =
  | (IteratorYieldResult<EntityComparison<T>> & ExcludeStatus)
  | IteratorReturnResult<CompareConclusion<T>>;
