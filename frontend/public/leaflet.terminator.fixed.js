// leaflet.terminator.fixed.js
// compacte versie van leaflet-terminator met nachtzijde gevuld
(function (factory, window) {
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
      L.Polygon.prototype.initialize.call(this, this._compute(), options);
    },
    setTime: function (time) {
      this._time = time || new Date();
      this.setLatLngs(this._compute());
    },
    _compute: function () {
      const now = this._time || new Date();
      const julianDay =
        now / 86400000 + 2440587.5; // Unix → JD
      const g = (357.529 + 0.98560028 * (julianDay - 2451545)) * (Math.PI / 180);
      const q = (280.459 + 0.98564736 * (julianDay - 2451545)) % 360;
      const Ls = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
      const e = 23.439 * (Math.PI / 180);
      const RA = Math.atan2(Math.cos(e) * Math.sin(Ls), Math.cos(Ls));
      const decl = Math.asin(Math.sin(e) * Math.sin(Ls));
      const eqt = q * (Math.PI / 180) - RA;
      const lng = -((now.getUTCHours() + now.getUTCMinutes() / 60) / 24) * 360;

      const pts = [];
      for (let i = -180; i <= 180; i += 1) {
        const c = (i + eqt * (180 / Math.PI) + 180 + lng) % 360 - 180;
        const lat = Math.atan(-Math.cos((c * Math.PI) / 180) / Math.tan(decl)) * (180 / Math.PI);
        pts.push([lat, i]);
      }
      // Nachtzijde = punten omgedraaid zodat gevulde deel nacht is
      return pts.reverse();
    },
  });

  L.terminator = function (options) {
    return new L.Terminator(options);
  };
  return L.Terminator;
});
