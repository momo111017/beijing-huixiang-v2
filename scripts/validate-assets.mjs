import { access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { ROUTE } from "../src/data/route-content.js";

const root = new URL("../", import.meta.url);
export async function validateAssets() {
  const errors = [];
  for (const stop of ROUTE.stops) {
    for (const path of [stop.audio.src, stop.audio.transcript]) {
      const url = new URL(path.replace("./", ""), root);
      try { await access(url, constants.R_OK); if ((await stat(url)).size === 0) errors.push(`${stop.id}: empty ${path}`); }
      catch { errors.push(`${stop.id}: missing ${path}`); }
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await validateAssets();
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log("asset validation passed");
}
