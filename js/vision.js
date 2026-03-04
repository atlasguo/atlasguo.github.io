(function () {
  var mapEl = document.getElementById("vision-journey-map");
  if (!mapEl || typeof L === "undefined") return;

  var map = L.map("vision-journey-map", {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    zoomAnimation: false,
    zoomDelta: 1,
    zoomSnap: 1,
    wheelPxPerZoomLevel: 160
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(map);

  map.createPane("visionTooltipTop");
  map.getPane("visionTooltipTop").style.zIndex = "760";
  map.createPane("visionPopupTop");
  map.getPane("visionPopupTop").style.zIndex = "900";

  var places = [
    {
      name: "Zibo",
      lat: 36.8131,
      lng: 118.0548,
      popup: {
        title: "Zibo",
        lines: ["1992-2008", "Hometown"]
      }
    },
    {
      name: "Jinan",
      lat: 36.6512,
      lng: 117.1201,
      popup: {
        title: "Jinan",
        lines: ["2008-2011", "Shandong Experimental High School"]
      }
    },
    {
      name: "Zhuhai",
      lat: 22.2710,
      lng: 113.5767,
      popup: {
        title: "Zhuhai",
        lines: ["2011-2013", "Sun Yat-sen University<br>(Zhuhai Campus)"]
      }
    },
    {
      name: "Taipei",
      lat: 25.0330,
      lng: 121.5654,
      popup: {
        title: "Taipei",
        lines: ["2013", "Chinese Culture University<br>(Exchange)"]
      }
    },
    {
      name: "Guangzhou",
      lat: 23.1291,
      lng: 113.2644,
      popup: {
        title: "Guangzhou",
        lines: ["2013-2015", "Sun Yat-sen University<br>(Guangzhou South Campus)"]
      }
    },
    {
      name: "Athens",
      lat: 33.9519,
      lng: -83.3576,
      popup: {
        title: "Athens",
        lines: ["2015-2017, 2020-2023, 2025-2026", "University of Georgia"]
      }
    },
    {
      name: "Madison",
      lat: 43.0731,
      lng: -89.4012,
      popup: {
        title: "Madison",
        lines: ["2017-2020, 2023-2025", "University of Wisconsin-Madison"]
      }
    },
    {
      name: "Cupertino",
      lat: 37.3229,
      lng: -122.0322,
      popup: {
        title: "Cupertino",
        lines: ["2025", "Apple Inc.<br>(Internship)"]
      }
    }
  ];
  var topLabelCities = new Set(["Madison", "Zibo", "Guangzhou"]);
  var labelCandidates = [
    { direction: "top", dx: 0, dy: -6 },
    { direction: "right", dx: 8, dy: 0 },
    { direction: "left", dx: -8, dy: 0 },
    { direction: "bottom", dx: 0, dy: 8 },
    { direction: "top", dx: 12, dy: -8 },
    { direction: "top", dx: -12, dy: -8 }
  ];
  var pointRecords = [];

  function hoverContent(place) {
    var title = (place.popup && place.popup.title) || place.name;
    var lines = (place.popup && Array.isArray(place.popup.lines)) ? place.popup.lines : [];
    var safeLines = lines.filter(Boolean);
    var body = safeLines.length ? "<br>" + safeLines.join("<br>") : "";
    return "<strong>" + title + "</strong>" + body;
  }

  var group = L.featureGroup();
  places.forEach(function (p) {
    var marker = L.circleMarker([p.lat, p.lng], {
      radius: 4,
      color: "#4f6321",
      fillColor: "#829b3f",
      fillOpacity: 0.95,
      weight: 2,
      interactive: true,
      bubblingMouseEvents: false
    }).addTo(group);
    marker.bindPopup(hoverContent(p), {
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      autoPan: false,
      pane: "visionPopupTop"
    });
    marker.on("mouseover", function () {
      marker.openPopup();
    });
    marker.on("mouseout", function () {
      marker.closePopup();
    });
    pointRecords.push({
      place: p,
      marker: marker,
      priority: topLabelCities.has(p.name) ? 1 : 0
    });
  });

  group.addTo(map);
  var focusBounds = group.getBounds().pad(0.35);
  map.fitBounds(focusBounds);
  map.setMaxBounds(focusBounds);
  map.options.maxBoundsViscosity = 1.0;
  var baseZoom = map.getZoom();
  var initialZoom = Math.min(19, baseZoom + 1);
  map.setMinZoom(initialZoom);
  map.setMaxZoom(Math.min(19, initialZoom + 4));
  map.setZoom(initialZoom);

  function overlapArea(a, b) {
    var w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h;
  }

  function labelBox(point, name, candidate) {
    var width = Math.max(44, name.length * 7.1 + 18);
    var height = 22;
    var left = point.x;
    var top = point.y;

    if (candidate.direction === "top") {
      left = point.x - width / 2 + candidate.dx;
      top = point.y - height + candidate.dy;
    } else if (candidate.direction === "bottom") {
      left = point.x - width / 2 + candidate.dx;
      top = point.y + candidate.dy;
    } else if (candidate.direction === "left") {
      left = point.x - width + candidate.dx;
      top = point.y - height / 2 + candidate.dy;
    } else {
      left = point.x + candidate.dx;
      top = point.y - height / 2 + candidate.dy;
    }

    return {
      left: left - 2,
      top: top - 2,
      right: left + width + 2,
      bottom: top + height + 2
    };
  }

  function overflowPenalty(box, size) {
    var px = 0;
    if (box.left < 0) px += -box.left;
    if (box.right > size.x) px += box.right - size.x;
    if (box.top < 0) px += -box.top;
    if (box.bottom > size.y) px += box.bottom - size.y;
    return px * 10;
  }

  function bindLabel(record, candidate, hidden) {
    if (record.marker.getTooltip()) {
      record.marker.unbindTooltip();
    }
    if (hidden) return;
    record.marker.bindTooltip(record.place.name, {
      permanent: true,
      direction: candidate.direction,
      offset: [candidate.dx, candidate.dy],
      opacity: 0.95,
      interactive: false,
      pane: record.priority ? "visionTooltipTop" : "tooltipPane"
    });
    record.marker.openTooltip();
  }

  function layoutLabels() {
    var size = map.getSize();
    var placed = [];
    var sorted = pointRecords.slice().sort(function (a, b) {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.place.name.localeCompare(b.place.name);
    });

    sorted.forEach(function (record) {
      var point = map.latLngToContainerPoint(record.marker.getLatLng());
      var best = labelCandidates[0];
      var bestScore = Number.POSITIVE_INFINITY;
      var bestOverlap = Number.POSITIVE_INFINITY;

      labelCandidates.forEach(function (candidate) {
        var box = labelBox(point, record.place.name, candidate);
        var overlap = 0;
        for (var i = 0; i < placed.length; i += 1) {
          overlap += overlapArea(box, placed[i]);
        }
        var score = overlap + overflowPenalty(box, size);
        if (candidate.direction !== "top") score += 8;
        if (score < bestScore) {
          bestScore = score;
          bestOverlap = overlap;
          best = candidate;
        }
      });

      var hide = !record.priority && bestOverlap > 280;
      bindLabel(record, best, hide);
      if (!hide) {
        placed.push(labelBox(point, record.place.name, best));
      }
    });
  }

  layoutLabels();
  map.on("zoomend moveend", layoutLabels);
})();
