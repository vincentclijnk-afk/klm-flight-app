/* Leaflet.Terminator plugin */
L.Terminator = function (options) {
  var terminator = {};

  function lng2rad(lng) {
    return (Math.PI * lng) / 180;
  }

  function rad2lng(rad) {
    return (180 * rad) / Math.PI;
  }

  function getCirclePoints(date) {
    var lng_deg = 0;
    var lat;
    var circle = [];

    var rad = Math.PI / 180;
    var time = date.getTime() / 86400000;
    var jd = 2440587.5 + time;
    var n = jd - 2451545.0;
    var L = (280.46 + 0.9856474 * n) % 360;
    var g = (357.528 + 0.9856003 * n) % 360;
    var lambda =
      L +
      1.915 * Math.sin(g * rad) +
      0.02 * Math.sin(2 * g * rad);
    var epsilon = 23.439 - 0.0000004 * n;
    var decl =
      Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad)) / rad;
    var eqt =
      (L - 0.0057183 - lambda + 2.466 * Math.sin(2 * L * rad) - 0.053 * Math.sin(4 * L * rad)) *
      4;
    for (var i = -180; i <= 180; i++) {
      lng_deg = i;
      var ha = (i + eqt / 4) * rad;
      lat = Math.atan(-Math.cos(ha) / Math.tan(decl * rad)) / rad;
      circle.push([lat, lng_deg]);
    }
    return circle;
  }

  terminator = L.polygon(getCirclePoints(new Date()), options);

  terminator.setTime = function (date) {
    this.setLatLngs(getCirclePoints(date));
  };

  return terminator;
};
L.terminator = function (options) {
  return new L.Terminator(options);
};
