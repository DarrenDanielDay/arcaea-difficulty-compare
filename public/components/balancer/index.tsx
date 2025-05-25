import "./style.css";
import { useEffect, useState } from "preact/hooks";
import { ExcludeStatus, Choice } from "../../core/models";
import { Title } from "../title";

export interface BalancerProp<T> extends ExcludeStatus {
  left: T;
  right: T;
  renderEntity: (entity: T) => JSX.Element;
  select: (choice: Choice) => void;
}
type Relation = null | Choice.GreaterThan | Choice.LessThan;

function relationClass(relation: Relation, inverse: boolean) {
  if (relation == null) {
    return "";
  }
  return (relation === Choice.GreaterThan) !== inverse ? "greater" : "less";
}

export const Balancer = <T extends unknown>({ renderEntity, left, right, canExclude, select }: BalancerProp<T>) => {
  const [relation, setRelation] = useState<Relation>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer != null) {
        clearTimeout(timer);
      }
    };
  }, [timer]);
  const selectOne = (inverse: boolean) => {
    const relation = inverse ? Choice.LessThan : Choice.GreaterThan;
    setRelation(relation);
    setTimer(
      setTimeout(() => {
        select(relation);
        setRelation(null);
      }, 300)
    );
  };
  const excludeOne = (inverse: boolean) => {
    select(inverse ? Choice.ExcludeRight : Choice.ExcludeLeft);
  };

  return (
    <div>
      <div class="compare my-3">
        <div class={`border p-3 balance-item ${relationClass(relation, false)}`} onClick={() => selectOne(false)}>
          {renderEntity(left)}
        </div>
        <div class={`border p-3 balance-item ${relationClass(relation, true)}`} onClick={() => selectOne(true)}>
          {renderEntity(right)}
        </div>
      </div>
      <div class="my-3 d-flex justify-content-around">
        <button class="btn btn-danger" disabled={!canExclude.left} onClick={() => excludeOne(false)}>
          排除此项
        </button>
        <button class="btn btn-danger" disabled={!canExclude.right} onClick={() => excludeOne(true)}>
          排除此项
        </button>
      </div>
    </div>
  );
};
