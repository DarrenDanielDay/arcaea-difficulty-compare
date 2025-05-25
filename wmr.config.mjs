import { defineConfig } from "wmr";

// Full list of options: https://wmr.dev/docs/configuration
export default defineConfig((options) => {
  return {
    port: 1238,
    publicPath: options.mode === "build" ? "/arcaea-difficulty-compare/" : "/",
  };
});
