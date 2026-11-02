#!/usr/bin/env node
// Dev convenience: refresh the vendored brand layer from the MCP site when this
// repo sits next to it. The copy in src/styles/brand.css is committed, because
// the deploy (Vercel) does not have the mcp repo. Without the sibling, this is a no-op.
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "../../../mcp/site/src/styles/theme.css");
const target = join(here, "../src/styles/brand.css");

if (existsSync(source)) {
  copyFileSync(source, target);
  console.log("brand.css synced from ../../mcp/site/src/styles/theme.css");
} else {
  console.log("brand.css: mcp checkout not found, keeping the vendored copy");
}
