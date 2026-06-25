import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: ["esm"],
  target: "node20",
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
  // Bundle our src + the generated client (extensionless imports); keep
  // runtime deps external so they resolve from node_modules.
  bundle: true,
});
