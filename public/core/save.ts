import { DBSchema, openDB } from "idb";
import { Entity, DetailedChoice } from "./models";
import { EntityFactory } from "./interfaces";
import { CompareTaskInit } from "./task";

export interface ProgressSave {
  id: string;
  choices: DetailedChoice[];
  initOrders: string[];
  algorithm: string;
}

interface IDBStoreSchema extends DBSchema {
  progress: {
    key: string;
    value: ProgressSave;
  };
}

export class ProgressStore<T> {
  update$ = new EventTarget();
  constructor(public readonly factory: EntityFactory<T>) {}

  #open() {
    return openDB<IDBStoreSchema>("strictly-partial-order", 1, {
      upgrade: (database, oldVersion, newVersion, transaction, event) => {
        database.createObjectStore("progress", { keyPath: "id" });
      },
    });
  }

  async list(): Promise<string[]> {
    const db = await this.#open();
    const keys = await db.getAllKeys("progress");
    db.close();
    return keys.map((k) => k.toString());
  }

  async put(save: ProgressSave) {
    const db = await this.#open();
    await db.put("progress", save);
    db.close();
    this.update$.dispatchEvent(new Event("update"));
  }

  async delete(id: string) {
    const db = await this.#open();
    await db.delete("progress", id);
    db.close();
    this.update$.dispatchEvent(new Event("update"));
  }

  async getSave(id: string) {
    const db = await this.#open();
    const save = await db.get("progress", id);
    return save;
  }

  async load(id: string): Promise<CompareTaskInit<T>> {
    const db = await this.#open();
    const save = await db.get("progress", id);
    if (!save) {
      throw new Error(`Save of${JSON.stringify(id)} not found`);
    }
    db.close();
    return {
      id: save.id,
      choices: save.choices,
      entities: await Promise.all(
        save.initOrders.map<Promise<Entity<T>>>(async (id) => ({
          id,
          data: await this.factory.create(id),
        }))
      ),
      algorithm: save.algorithm,
    };
  }
}
