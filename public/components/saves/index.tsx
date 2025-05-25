import { ProgressStore } from "../../core/save";
import { useEffect, useState } from "preact/hooks";
import { CompareTaskInit } from "../../core/task";

export interface SavesListProp<T> {
  store: ProgressStore<T>;
  onSelect: (init: CompareTaskInit<T>) => void;
}

export const SavesList = <T extends unknown>({ store, onSelect }: SavesListProp<T>) => {
  const [saves, setSaves] = useState<string[]>([]);
  useEffect(() => {
    store.update$.addEventListener("update", async () => {
      setSaves(await store.list());
    });
    return () => {
      store.update$.removeEventListener("update", async () => {
        setSaves(await store.list());
      });
    };
  }, [store]);
  useEffect(() => {
    (async () => {
      setSaves(await store.list());
    })();
  }, []);
  if (saves.length === 0) {
    return <div>暂无存档</div>;
  }
  return saves.map((saveId) => (
    <div class="border p-2 d-flex align-items-center justify-content-between" style={{ maxWidth: "24em" }} key={saveId}>
      <div class="align-self-start">{saveId}</div>
      <div class="align-self-end d-flex justify-content-center align-items-center" style={{ width: "8em" }}>
        <button
          class="btn btn-primary btn-sm mx-1"
          onClick={async () => {
            const init = await store.load(saveId);
            onSelect(init);
          }}
        >
          加载
        </button>
        <button
          class="btn btn-danger btn-sm"
          onClick={async (e) => {
            e.stopPropagation();
            if (!confirm("确定删除存档吗？")) {
              return;
            }
            await store.delete(saveId);
            setSaves(await store.list());
          }}
        >
          删除
        </button>
      </div>
    </div>
  ));
};
