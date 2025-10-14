// L.Terminator.js
// Eenvoudige versie van de Leaflet terminator (dag/nacht grens)
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["leaflet"], factory);
  } else if (typeof module !== "undefined") {
    module.exports = factory(require("leaflet"));
  } else {
    factory(window.L);
  }
})(function (L) {
  L.Terminator = L.Polygon.extend({
    initialize: function (options) {
      this.options = options || {};
      this.setTime(this.options.time || new Date());
    },
    setTime: function (time) {
      this.options.time = time;
      const latlngs = [];
      const dayOfYear =
        Math.floor((time - new Date(time.getFullYear(), 0, 0)) / 86400000) || 0;
      const decl =
        23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
      for (let lon = -180; lon <= 180; lon++) {
        const lat =
          Math.atan(
            -Math.cos((lon + (time.getUTCHours() * 15)) * (Math.PI / 180)) /
              Math.tan(decl * (Math.PI / 180))
          ) *
          (180 / Math.PI);
        latlngs.push([lat, lon]);
      }
      this.setLatLngs([latlngs]);
      return this;
    },
  });

  L.terminator = function (options) {
    return new L.Terminator(options);
  };
});
