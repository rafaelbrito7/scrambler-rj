// Decodes the compact line a routing service returns (the "polyline" encoding at six decimal
// places) into [longitude, latitude] pairs, the order maps draw in. Pure: the browser uses it.
export function decodePolyline6(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  function next() {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    return result & 1 ? ~(result >> 1) : result >> 1;
  }

  while (index < encoded.length) {
    lat += next();
    lon += next();
    points.push([lon / 1e6, lat / 1e6]);
  }

  return points;
}

// The reverse: a line of [longitude, latitude] pairs into the same compact text, so a track
// the group sent can be stored in one column.
export function encodePolyline6(line: [number, number][]) {
  let encoded = "";
  let previousLat = 0;
  let previousLon = 0;

  function write(delta: number) {
    let value = delta < 0 ? ~(delta << 1) : delta << 1;

    while (value >= 0x20) {
      encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
      value >>>= 5;
    }

    encoded += String.fromCharCode(value + 63);
  }

  for (const [lon, lat] of line) {
    const roundedLat = Math.round(lat * 1e6);
    const roundedLon = Math.round(lon * 1e6);

    write(roundedLat - previousLat);
    write(roundedLon - previousLon);
    previousLat = roundedLat;
    previousLon = roundedLon;
  }

  return encoded;
}
