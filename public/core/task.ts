import { createAlgorithm } from "./algorithms/factory";
import {
  EntityComparison,
  Entity,
  Choice,
  DetailedChoice,
  UserChoiceType,
  CompareSortAlgorithm,
  CompareAlgorithmProgress,
  CompareAlgorithmProgressStatus,
  CompareTaskStatus,
} from "./models";

export interface CompareTaskInit<T> {
  id: string;
  entities: Entity<T>[];
  choices: DetailedChoice[];
  algorithm: string;
}

export class CompareTaskFactory<T> {
  id: string;
  entities: Entity<T>[];
  workspace: string[] = [];
  prevChoices: DetailedChoice[];
  choices: DetailedChoice[] = [];
  entityMap = new Map<string, Entity<T>>();
  algorithm: CompareSortAlgorithm;
  constructor(init: CompareTaskInit<T>) {
    this.id = init.id;
    this.entities = init.entities;
    this.prevChoices = structuredClone(init.choices);
    this.algorithm = createAlgorithm(init.algorithm);
    this.#initMap();
    this.#initWorkspace();
  }

  #initMap() {
    this.entityMap.clear();
    for (const entity of this.entities) {
      if (this.entityMap.has(entity.id)) {
        throw new Error(`Duplicated id: ${entity.id}`);
      }
      this.entityMap.set(entity.id, entity);
    }
  }

  #initWorkspace() {
    this.workspace.length = 0;
    for (const entity of this.entities) {
      this.workspace.push(entity.id);
    }
  }

  load(): RunningCompareTask<T> {
    const running = new RunningCompareTask(this);
    return running.loadChoices(this.prevChoices);
  }
}

class RunningCompareTask<T> {
  factory: CompareTaskFactory<T>;
  progress: CompareAlgorithmProgress;
  status: CompareTaskStatus<T>;
  excluded = new Set<string>();
  appeared = new Set<string>();
  choices: DetailedChoice[] = [];

  constructor(factory: CompareTaskFactory<T>) {
    this.factory = factory;
    this.progress = factory.algorithm.start(factory.workspace);
    this.status = this.#createStatus(this.progress.next());
  }

  next(choice: Choice) {
    if (this.status.done) {
      console.warn(`Already done.`);
      return this.status;
    }
    const { value: comparison } = this.status;
    if (choice === Choice.ExcludeLeft || choice === Choice.ExcludeRight) {
      const excludeId = choice === Choice.ExcludeLeft ? comparison.left.id : comparison.right.id;
      this.excluded.add(excludeId);
      this.choices.push({
        type: UserChoiceType.Exclude,
        left: comparison.left.id,
        right: comparison.right.id,
        id: excludeId,
        choice,
      });
    } else {
      this.choices.push({
        type: UserChoiceType.Compare,
        left: comparison.left.id,
        right: comparison.right.id,
        choice: choice,
      });
      // Once a choice is made, user cannot exclude any of them.
      this.appeared.add(comparison.left.id);
      this.appeared.add(comparison.right.id);
    }
    this.status = this.#createStatus(this.progress.next(choice));
    return this.status;
  }

  dump(): CompareTaskInit<T> {
    return {
      id: this.factory.id,
      choices: this.choices,
      entities: this.factory.entities,
      algorithm: this.factory.algorithm.name,
    };
  }

  loadChoices(choices: DetailedChoice[]) {
    let status = this.status;
    for (const choice of choices) {
      if (status.done) {
        throw new Error(`Invalid status: choice not used.`);
      }
      const comparison = status.value;
      switch (choice.type) {
        case UserChoiceType.Compare:
          if (choice.left !== comparison.left.id || choice.right !== comparison.right.id) {
            throw new Error(`Invalid status: comparison not the same.`);
          }
          status = this.next(choice.choice);
          break;
        case UserChoiceType.Exclude:
          if (choice.id === comparison.left.id) {
            status = this.next(Choice.ExcludeLeft);
          } else if (choice.id === comparison.right.id) {
            status = this.next(Choice.ExcludeRight);
          } else {
            throw new Error(`Invalid status: exclusion not the same`);
          }
          break;
        default:
          throw new Error(`Invalid choice ${JSON.stringify(choice)}`);
      }
    }
    return this;
  }

  estimateWorst(): number {
    return this.factory.algorithm.worst(
      this.factory.workspace,
      this.choices.map((choice) => choice.choice)
    );
  }

  #createStatus(status: CompareAlgorithmProgressStatus): CompareTaskStatus<T> {
    if (status.done) {
      return {
        done: true,
        value: {
          ordered: status.value.map((id) => this.#get(id)),
          excluded: Array.from(this.excluded, (id) => this.#get(id)),
        },
      };
    }
    const comparison = status.value;
    return {
      value: {
        left: this.#get(comparison.left),
        right: this.#get(comparison.right),
      },
      canExclude: {
        left: !this.appeared.has(comparison.left),
        right: !this.appeared.has(comparison.right),
      },
    };
  }

  #get(id: string) {
    return this.factory.entityMap.get(id)!;
  }
}
