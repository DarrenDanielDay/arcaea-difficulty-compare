import { useState } from "preact/hooks";
import { ProgressStore } from "../core/save";
import { PublicInterfaces } from "../core/interfaces";

export const useStore = <T>(impls: PublicInterfaces<T>) => {
  const [store] = useState(() => new ProgressStore<T>(impls.factory));
  return store;
};
