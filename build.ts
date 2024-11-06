import { execSync } from "node:child_process";
import json from "./package.json";
import type { BuildConfig } from "bun";

execSync("rm -rf dist");

const buildConfig: BuildConfig = {
  entrypoints: [
    "src/index.ts",
    "src/domain/aggregate/index.ts",
    "src/domain/context/index.ts",
    "src/domain/entity/index.ts",
    "src/domain/entity/unique-entity.ts",
    "src/domain/events/index.ts",
    "src/domain/value-object/index.ts",
    "src/domain/repository.ts",
    "src/domain/use-cases-port.ts",
    "src/infra/index.ts",
    "src/utils/index.ts",
  ],
  outdir: "dist",
  format: "cjs",
  target: "node",
  external: [
    ...Object.keys(json.dependencies),
    ...Object.keys(json.devDependencies),
  ],
};

await Bun.build({
  ...buildConfig,
  naming: "[dir]/[name].js",
});

await Bun.build({
  ...buildConfig,
  format: "esm",
  naming: "[dir]/[name].mjs",
});

execSync("bun tsc --emitDeclarationOnly --outDir dist");
execSync("mv dist/src/* dist");
execSync("rm -rf dist/tsconfig.tsbuildinfo");
execSync("rm -rf dist/src");
