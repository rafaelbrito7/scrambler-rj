// The dark base map. Requests from the site's own pages are authorised by domain on the map
// provider's side (and need nothing on localhost), so no key ever reaches the browser.
export const MAP_STYLE = "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json";
export const ROUTE_ENDPOINT = "https://api.stadiamaps.com/route/v1";

// Guanabara Bay, wide enough to show the city and the way up the mountains.
export const RIO: [number, number] = [-43.2, -22.75];

export const EMBER = "#ea6a2e";

// Where the map library finds its worker; see scripts/copy-map-worker.mjs.
export const MAP_WORKER = "/maplibre/maplibre-gl-worker.mjs";
