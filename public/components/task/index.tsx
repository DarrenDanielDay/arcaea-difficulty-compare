import { useState } from "preact/hooks";
import { CompareTaskFactory, CompareTaskInit } from "../../core/task";
import { Balancer } from "../balancer";
import { ProgressSave, ProgressStore } from "../../core/save";
import { ExportFile, MemoryFile } from "../export";
import { ConstantGenerator } from "../constant-generator";

export interface CompareTaskProp<T> {
  store: ProgressStore<T>;
  taskInit: CompareTaskInit<T>;
  renderEntity: (entity: T) => JSX.Element;
}

export const CompareTask = <T extends unknown>({ store, taskInit, renderEntity }: CompareTaskProp<T>) => {
  const [{ instance }, setTaskState] = useState(() => {
    const task = new CompareTaskFactory(taskInit);
    return { instance: task.load() };
  });
  const getSave = (): ProgressSave => {
    const dump = instance.dump();
    return {
      id: dump.id,
      choices: dump.choices,
      initOrders: dump.entities.map((entity) => entity.id),
      algorithm: dump.algorithm,
    };
  };
  const savebtn = (
    <div class="my-3">
      <button
        class="btn btn-success"
        onClick={async () => {
          await store.put(getSave());
        }}
      >
        保存进度
      </button>
    </div>
  );
  const { status } = instance;
  if (status.done) {
    const conclusion = status.value;
    const { excluded, ordered } = conclusion;
    const getCompareResultFile = async (): Promise<MemoryFile> => {
      const NEWLINE = "\n";
      const result =
        ordered.map((e) => e.id).join(NEWLINE) + `${NEWLINE}---${NEWLINE}` + excluded.map((e) => e.id).join(NEWLINE);
      return {
        blob: new Blob([result], { type: "text/plain" }),
        filename: `${instance.factory.id}.txt`,
      };
    };
    const getSaveFile = async (): Promise<MemoryFile> => {
      const save = getSave();
      return {
        blob: new Blob([JSON.stringify(save)], { type: "application/json" }),
        filename: `${instance.factory.id}.json`,
      };
    };
    return (
      <>
        {savebtn}
        <div class="my-3">已完成比较（进度仍需手动保存）。</div>
        <ExportFile exportText="导出比较结果" getFile={getCompareResultFile}></ExportFile>
        <ExportFile exportText="导出存档" getFile={getSaveFile} />
        {/* @ts-expect-error */}
        <ConstantGenerator conclusion={conclusion} />
      </>
    );
  }
  const { left, right } = status.value;
  return (
    <div>
      <div class="my-3 small">
        请点击选择您认为<mark>更难</mark>
        的谱面。如果您没有游玩过其中一个谱面，或者认为其中一个谱面的难度会严重影响整体的难度分布，您可以选择排除它。一旦您选择排除该谱面，您将无法在本存档中与其他谱面比较它。相反的，如果您选择了比较两个谱面，您将无法再排除两者。
      </div>
      <div class="my-3 small">
        如果您对当前已经选择的结果确认无误，您可以点击<mark>保存进度</mark>
        按钮来保存当前的进度。如果您不小心选错了，您可以从保存的位置重新加载进度。
      </div>
      <Balancer<T>
        left={left.data}
        right={right.data}
        renderEntity={renderEntity}
        select={(choice) => {
          instance.next(choice);
          console.log(JSON.stringify(instance.dump()));
          setTaskState({ instance });
        }}
        canExclude={status.canExclude}
      ></Balancer>
      <div class="my-3">
        <p>在最坏情况下，您还需要比较 {instance.estimateWorst()} 次。</p>
        {savebtn}
      </div>
    </div>
  );
};
