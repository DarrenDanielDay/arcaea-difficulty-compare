import { render } from "preact";
import { App } from "./components/app";
import { impls } from "./adapter";

render(<App impls={impls} />, document.body);
