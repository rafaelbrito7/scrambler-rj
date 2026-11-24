// The map library runs part of its work in a browser worker that it loads by address. The
// bundler does not ship that file, so it is copied into the site's public folder. Runs after every install so the copy always matches the library.
import { cpSync, mkdirSync } from "node:fs";

const from = "node_modules/maplibre-gl/dist";
const to = "public/maplibre";

mkdirSync(to, { recursive: true });

cpSync(`${from}/maplibre-gl-worker.mjs`, `${to}/maplibre-gl-worker.mjs`);
