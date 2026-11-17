import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

export function harness(data: DemoData) {
  const context = createContext({
    document: {
      getElementById: () => ({ innerHTML: "" }),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      documentElement: {},
    },
    window: { addEventListener: () => {}, setTimeout, clearTimeout, scrollTo: () => {} },
    getComputedStyle: () => ({ paddingLeft: "0px" }),
  });
  runInContext(`var BLOODSTAT_DATA = ${JSON.stringify(data)};`, context);
  for (const file of ["more.js", "app.js"]) {
    runInContext(readFileSync(new URL(`../demo/${file}`, import.meta.url), "utf8"), context, { filename: file });
  }
  return <T = unknown>(expression: string): T => structuredClone(runInContext(expression, context));
}
