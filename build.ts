import { execSync } from "node:child_process";
import json from "./package.json";

execSync("rm -rf dist");
await Bun.build({
  entrypoints: [
    "src/index.ts",
    "src/+config.ts",
    "src/components/clientOnly.tsx",
    "src/components/withFallback.tsx",
    "src/components/FallbackErrorBoundary.tsx",
    "src/providers/ReactQueryProvider.tsx",
    "src/query/+config.ts",
    "src/hooks/useData.ts",
    "src/hooks/usePageContext.ts",
    "src/render/onRenderClient.tsx",
    "src/render/onRenderHtml.tsx",
  ],
  outdir: "dist",
  target: "bun",
  sourcemap: "inline",
  external: [...Object.keys(json.peerDependencies)],
});

execSync("bun run tsc --emitDeclarationOnly --outDir dist");
execSync("mv dist/src/* dist");
execSync("cp src/typing.d.ts dist");
execSync("cp src/typing.d.ts dist");
execSync("rm -rf dist/tsconfig.tsbuildinfo");
