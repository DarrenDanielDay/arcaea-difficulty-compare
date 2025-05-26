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
  const importSaves = (
    <form
      class="my-2"
      onSubmit={(e) => {
        e.preventDefault();
        const input = document.getElementById("saves-input") as HTMLInputElement;
        if (input.files?.length) {
          input.files[0].text().then((text) => {
            const save = JSON.parse(text);
            store.put(save);
          });
        }
      }}
    >
      <div class="input-group mb-3">
        <input placeholder="选择存档文件" type="file" class="form-control" id="saves-input" accept=".json" />
        <button class="btn btn-primary" type="submit">
          导入存档
        </button>
      </div>
    </form>
  );
  if (saves.length === 0) {
    return (
      <>
        <div>暂无存档</div>
        {importSaves}
      </>
    );
  }
  const list = saves.map((saveId) => (
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
          }}
        >
          删除
        </button>
      </div>
    </div>
  ));
  return (
    <>
      {list}
      {importSaves}
    </>
  );
};
