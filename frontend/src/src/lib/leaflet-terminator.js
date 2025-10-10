import L from "leaflet";

// Leaflet Terminator plugin (ESM compatibel voor Vite/React)
L.terminator = function (options = {}) {
  const defaultOptions = {
    fillOpacity: 0.5,
    fillColor: "#000000",
    color: "#000000",
    opacity: 0.3,
  };
  const settings = { ...defaultOptions, ...options };

  function getTerminatorCoords(date) {
    const rad = Math.PI / 180;
    const coords = [];
    const jDate = date / 86400000 + 2440587.5;
    const n = jDate - 2451545.0;
    const dec = (23.44 * Math.PI / 180) * Math.sin((2 * Math.PI / 365.25) * n);

    for (let lon = -180; lon <= 180; lon++) {
      const lng = lon;
      const lat = Math.atan(-Math.cos(lon * rad) / Math.tan(dec)) / rad;
      coords.push([lat, lng]);
    }
    coords.push(coords[0]);
    return coords;
  }

  const today = new Date();
  const coords = getTerminatorCoords(today);

  const layer = L.polygon(coords, settings);

  layer.setTime = function (time) {
    const newCoords = getTerminatorCoords(time);
    this.setLatLngs(newCoords);
  };

  return layer;
};

export default L;
