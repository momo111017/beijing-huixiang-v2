import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const required = ["<html lang=\"ru\">", "id=\"main-content\"", "id=\"home-map\"", "id=\"route-map\"", "id=\"route-stop-list\"", "id=\"guide-audio\"", "id=\"archive-view\"", "id=\"language-switch\""];
const errors = required.filter((token) => !html.includes(token)).map((token) => `missing ${token}`);
if (/data-view="admin"/.test(html)) errors.push("tourist navigation exposes admin");
if (/data-view="map"/.test(html)) errors.push("map is exposed as a separate main view");
if (/data-view="task"/.test(html)) errors.push("task is exposed as a separate main view");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("html validation passed");
