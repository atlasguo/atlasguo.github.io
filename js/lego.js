(function ($) {
  "use strict";

  var setupLegoSearch = function () {
    var $searchInput = $('#lego-search');
    if (!$searchInput.length) {
      return;
    }

    var $searchWrap = $searchInput.closest('.portfolio-search');
    var $searchClear = $('#lego-search-clear');
    var $filters = $('#lego-filters');
    var $filtersLabel = $('#lego-filters-label');
    var $intro = $('#lego-intro');
    var $outro = $('#lego-outro');
    var $items = $('.portfolio-item').filter(function () {
      return $(this).find('.portfolio-link').length > 0;
    });
    var resizeTimer = null;
    var mapTypeFilter = '*';
    var mediumFilter = '*';


    var syncCardShellWidths = function () {
      $items.each(function () {
        var $item = $(this);
        var $link = $item.find('.portfolio-link').first();
        if ($link.length) {
          $item.css('--portfolio-shell-width', $link.outerWidth() + 'px');
        }
      });
    };

    var matchesSearch = function ($item, query) {
      if (!query) {
        return true;
      }

      var itemText = $item.text();
      var classText = $item.attr('class') || '';
      var tagKeywords = classText
        .split(' ')
        .filter(function (className) {
          return className.indexOf('tag_') === 0;
        })
        .map(function (className) {
          return className.replace('tag_', '').replace(/_/g, ' ');
        })
        .join(' ');

      var combinedText = (itemText + ' ' + tagKeywords).toLowerCase();
      return combinedText.indexOf(query) !== -1;
    };

    var matchesFilter = function ($item) {
      var matchMapType = mapTypeFilter === '*' ? true : $item.is(mapTypeFilter);
      var matchMedium = mediumFilter === '*' ? true : $item.is(mediumFilter);
      return matchMapType && matchMedium;
    };

    var syncFilterState = function () {
      if (!$filters.length) {
        return;
      }
      $filters.find('a[data-filter]').removeClass('active').attr('aria-pressed', 'false');

      var isResetActive = mapTypeFilter === '*' && mediumFilter === '*';
      $filters.find('a[data-group="reset"]').toggleClass('active', isResetActive).attr('aria-pressed', isResetActive ? 'true' : 'false');

      if (mapTypeFilter !== '*') {
        $filters.find('a[data-group="map_type"][data-filter="' + mapTypeFilter + '"]').addClass('active').attr('aria-pressed', 'true');
      }
      if (mediumFilter !== '*') {
        $filters.find('a[data-group="medium"][data-filter="' + mediumFilter + '"]').addClass('active').attr('aria-pressed', 'true');
      }
    };

    var applyView = function () {
      var query = $searchInput.val().trim().toLowerCase();
      var hasSearch = query.length > 0;

      $searchWrap.toggleClass('has-value', hasSearch);
      $intro.toggleClass('is-hidden', hasSearch);
      $outro.removeClass('is-hidden');
      $filters.add($filtersLabel).toggleClass('is-hidden', hasSearch);

      $items.each(function () {
        var $item = $(this);
        var visible = matchesSearch($item, query) && matchesFilter($item);
        $item.toggleClass('is-hidden', !visible);
      });

      syncCardShellWidths();
    };

    $searchInput.on('input', applyView);

    $searchClear.on('click', function () {
      $searchInput.val('');
      applyView();
      $searchInput.focus();
    });

    $filters.on('click', 'a[data-filter]', function (e) {
      e.preventDefault();
      var $clicked = $(this);
      var group = $clicked.attr('data-group') || '';
      var nextFilter = $clicked.attr('data-filter') || '*';

      if (group === 'reset') {
        mapTypeFilter = '*';
        mediumFilter = '*';
      } else if (group === 'map_type') {
        mapTypeFilter = mapTypeFilter === nextFilter ? '*' : nextFilter;
      } else if (group === 'medium') {
        mediumFilter = mediumFilter === nextFilter ? '*' : nextFilter;
      } else {
        mapTypeFilter = mapTypeFilter === nextFilter ? '*' : nextFilter;
      }

      syncFilterState();
      applyView();
    });

    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncCardShellWidths, 100);
    });

    syncFilterState();
    applyView();
    syncCardShellWidths();
  };

  $(window).on('load', function () {
    setupLegoSearch();
  });
})(jQuery);

(function () {
  var mapEl = document.getElementById("lego-journey-map");
  if (!mapEl || typeof L === "undefined") return;

  var worldBounds = L.latLngBounds(
    L.latLng(-85.05112878, -180),
    L.latLng(85.05112878, 180)
  );

  var map = L.map("lego-journey-map", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    tap: false,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1.0,
    zoomAnimation: false,
    zoomDelta: 1,
    zoomSnap: 1,
    wheelPxPerZoomLevel: 160
  });
  L.control.attribution({ prefix: false }).addTo(map);

  L.tileLayer("https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    updateWhenIdle: true,
    noWrap: true,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(map);

  map.createPane("legoTooltipTop");
  map.getPane("legoTooltipTop").style.zIndex = "760";
  map.createPane("legoPopupTop");
  map.getPane("legoPopupTop").style.zIndex = "900";

  var places = [
    {
      name: "Wisconsin",
      lat: 44.6243,
      lng: -89.9941,
      popup: {
        title: "Wisconsin",
        items: [
          { label: "LEGO Map of Wisconsin", href: "lego/lego_wisconsin.html" }
        ]
      }
    },
    {
      name: "Colorado",
      lat: 39.1130,
      lng: -105.3589,
      popup: {
        title: "Colorado",
        items: [
          { label: "LEGO Map of Colorado", href: "lego/lego_colorado.html" }
        ]
      }
    },
    {
      name: "Georgia",
      lat: 32.6415,
      lng: -83.4426,
      popup: {
        title: "Georgia",
        items: [
          { label: "LEGO Style Topographic Map of Georgia", href: "lego/lego_georgia.html" },
          { label: "Mini LEGO Map of Georgia", href: "lego/lego_mini_ga.html" }
        ]
      }
    },
    {
      name: "Arizona",
      lat: 34.1682,
      lng: -111.9309,
      popup: {
        title: "Arizona",
        items: [
          { label: "Physical Geography of Arizona in LEGO Style", href: "lego/lego_arizona.html" }
        ]
      }
    },
    {
      name: "New Zealand",
      lat: -41.2865,
      lng: 174.7762,
      popup: {
        title: "New Zealand",
        items: [
          { label: "Physical Geography of New Zealand in LEGO Style", href: "lego/lego_new_zealand.html" }
        ]
      }
    },
    {
      name: "North America",
      lat: 45.0000,
      lng: -100.0000,
      popup: {
        title: "North America",
        items: [
          { label: "LEGO Map of North America", href: "lego/lego_north_america.html" }
        ]
      }
    },
    {
      name: "Seattle-Tacoma",
      lat: 47.2529,
      lng: -122.4443,
      popup: {
        title: "Seattle-Tacoma Area",
        items: [
          { label: "Lego Style Map Quilt for NACIS 2024", href: "lego/lego_quilt.html" }
        ]
      }
    },
    {
      name: "Tennessee",
      lat: 35.8580,
      lng: -86.3505,
      popup: {
        title: "Tennessee",
        items: [
          { label: "LEGO Topographic Map of Tennessee", href: "lego/lego_tennessee.html" }
        ]
      }
    },
    {
      name: "United States",
      lat: 39.8283,
      lng: -98.5795,
      popup: {
        title: "United States",
        items: [
          { label: "LEGO Cartogram of U.S. Presidential Election 2024", href: "lego/lego_election_2024.html" },
          { label: "Gridded Cartogram of U.S. Population", href: "lego/us_pop_cartogram.html" }
        ]
      }
    },
    {
      name: "Null Island",
      lat: 0,
      lng: 0,
      popup: {
        title: "Null Island",
        items: [
          { label: "LEGO Cube Globe", href: "lego/lego_globe.html" },
          { label: "LEGO Moon Map", href: "lego/lego_moon.html" },
          { label: "LEGO 2026 New Year Map", href: "lego/lego_2026.html" }
        ]
      }
    },
    {
      name: "West Hemisphere",
      lat: 0,
      lng: -90,
      popup: {
        title: "Western Hemisphere",
        items: [
          { label: "LEGO Hemisphere World Map", href: "lego/lego_hemispheres.html" }
        ]
      }
    },
    {
      name: "East Hemisphere",
      lat: 0,
      lng: 90,
      popup: {
        title: "Eastern Hemisphere",
        items: [
          { label: "LEGO Hemisphere World Map", href: "lego/lego_hemispheres.html" }
        ]
      }
    },
    {
      name: "Ukraine",
      lat: 49.0000,
      lng: 31.0000,
      popup: {
        title: "Ukraine",
        items: [
          { label: "LEGO Map of Ukraine in Conflict", href: "lego/lego_ukraine.html" }
        ]
      }
    },
    {
      name: "Madison",
      lat: 43.0731,
      lng: -89.4012,
      popup: {
        title: "Madison",
        items: [
          { label: "3D LEGO Map of Madison City Flag", href: "lego/lego_madison_flag.html" },
          { label: "LEGO Madison BRT Map", href: "lego/lego_madison_brt.html" },
          { label: "LEGO Christmas- Themed Map of Madison", href: "lego/lego_madison_christmas.html" }
        ]
      }
    },
    {
      name: "Ireland",
      lat: 53.1424,
      lng: -7.6921,
      popup: {
        title: "Ireland",
        items: [
          { label: "Mini LEGO Map of Ireland", href: "lego/lego_ireland.html" }
        ]
      }
    },
    {
      name: "California",
      lat: 36.7783,
      lng: -119.4179,
      popup: {
        title: "California",
        items: [
          { label: "LEGO Style Topographic Map of California", href: "lego/lego_california.html" },
          { label: "Apple-Themed Topographic Map of California", href: "lego/lego_apple.html" }
        ]
      }
    },
    {
      name: "Cupertino",
      lat: 37.3229,
      lng: -122.0322,
      popup: {
        title: "Cupertino",
        items: [
          { label: "LEGO Apple Maps Icon", href: "lego/lego_apple_maps.html" }
        ]
      }
    },
    {
      name: "Pennsylvania",
      lat: 40.8781,
      lng: -77.7996,
      popup: {
        title: "Pennsylvania",
        items: [
          { label: "LEGO Map of Pennsylvania", href: "lego/lego_pa.html" }
        ]
      }
    },
    {
      name: "Atlanta",
      lat: 33.7490,
      lng: -84.3880,
      popup: {
        title: "Atlanta",
        items: [
          { label: "LEGO Atlanta Metro (MARTA) Map", href: "lego/lego_marta.html" }
        ]
      }
    },
    {
      name: "Athens",
      lat: 33.9519,
      lng: -83.3576,
      popup: {
        title: "Athens, Georgia",
        items: [
          { label: "LEGO Georgia Map with UGA Logo", href: "lego/lego_uga.html" }
        ]
      }
    },
    {
      name: "Great Lakes",
      lat: 44.8000,
      lng: -84.5000,
      popup: {
        title: "Great Lakes",
        items: [
          { label: "LEGO Bathymetric Map of the Great Lakes", href: "lego/lego_great_lakes.html" }
        ]
      }
    },
    {
      name: "Lawrenceville",
      lat: 33.9562,
      lng: -83.9879,
      popup: {
        title: "Lawrenceville, Georgia",
        items: [
          { label: "LEGO Map of Lawrenceville", href: "lego/lego_lawrenceville.html" }
        ]
      }
    },
    {
      name: "Mountain View",
      lat: 37.4220,
      lng: -122.0841,
      popup: {
        title: "Google HQ",
        items: [
          { label: "LEGO Google Maps Icon", href: "lego/lego_google_maps.html" }
        ]
      }
    },
    {
      name: "British Isles",
      lat: 54.5000,
      lng: -4.5000,
      popup: {
        title: "British Isles",
        items: [
          { label: "LEGO Map of the UK and Ireland", href: "lego/lego_uk_ie.html" },
          { label: "LEGO Topographic Map of the British Isles", href: "lego/lego_british_isles.html" }
        ]
      }
    },
    {
      name: "Kanto",
      lat: 35.6762,
      lng: 139.6503,
      popup: {
        title: "Kanto, Japan",
        items: [
          { label: "Pokemon Kanto Region Map", href: "lego/pokemon.html" }
        ]
      }
    }
  ];

  var topLabelCities = {
    Madison: true,
    Georgia: true,
    California: true,
    BritishIsles: false,
    NewZealand: false,
    UnitedStates: true
  };

  var labelCandidates = [
    { direction: "top", dx: 0, dy: -1 },
    { direction: "right", dx: 3, dy: 0 },
    { direction: "left", dx: -3, dy: 0 },
    { direction: "bottom", dx: 0, dy: 3 },
    { direction: "top", dx: 4, dy: -3 },
    { direction: "top", dx: -4, dy: -3 },
    { direction: "right", dx: 6, dy: -1 },
    { direction: "left", dx: -6, dy: -1 },
    { direction: "bottom", dx: 4, dy: 3 },
    { direction: "bottom", dx: -4, dy: 3 }
  ];

  var pointRecords = [];
  var pinnedMarker = null;
  var legoBrickIcon = L.icon({
    iconUrl: "assets/lego_marker_icon.png",
    className: "lego-map-marker",
    iconSize: [18, 12],
    iconAnchor: [9, 6],
    popupAnchor: [0, -7]
  });

  function hoverContent(place) {
    var title = (place.popup && place.popup.title) || place.name;
    var items = (place.popup && Array.isArray(place.popup.items)) ? place.popup.items : [];
    var safeItems = items.filter(function (item) {
      return item && item.label;
    });
    var body = "";
    if (safeItems.length) {
      body = "<div style=\"margin-top: 6px;\">";
      safeItems.forEach(function (item, index) {
        var line = item.href
          ? "<a href=\"" + item.href + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + item.label + "</a>"
          : item.label;
        body += line;
        if (index < safeItems.length - 1) {
          body += "<br>";
        }
      });
      body += "</div>";
    }
    return "<strong>" + title + "</strong>" + body;
  }

  var group = L.featureGroup();
  places.forEach(function (place) {
    var marker = L.marker([place.lat, place.lng], {
      icon: legoBrickIcon,
      interactive: true,
      bubblingMouseEvents: false
    }).addTo(group);

    marker.bindPopup(hoverContent(place), {
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      autoPan: false,
      pane: "legoPopupTop"
    });

    marker.on("mouseover", function () {
      if (pinnedMarker !== marker) {
        marker.openPopup();
      }
    });

    marker.on("mouseout", function () {
      if (pinnedMarker !== marker) {
        marker.closePopup();
      }
    });

    marker.on("click", function () {
      if (pinnedMarker && pinnedMarker !== marker) {
        pinnedMarker.closePopup();
      }

      if (pinnedMarker === marker) {
        pinnedMarker = null;
        marker.closePopup();
        return;
      }

      pinnedMarker = marker;
      marker.openPopup();
    });

    pointRecords.push({
      place: place,
      marker: marker,
      priority: topLabelCities[place.name] ? 1 : 0
    });
  });

  group.addTo(map);
  var focusBounds = group.getBounds().pad(0.32);
  var MAX_ZOOM = 7;
  var userInteracted = false;

  function applyInitialViewport() {
    map.fitBounds(focusBounds, { animate: false, maxZoom: MAX_ZOOM });
    var fitZoom = map.getZoom();
    map.setMinZoom(fitZoom);
    map.setMaxZoom(MAX_ZOOM);
    var boostedZoom = Math.min(MAX_ZOOM, map.getZoom() + 1);
    map.setZoom(boostedZoom, { animate: false });
  }

  function syncMapSize() {
    map.invalidateSize({ pan: false, animate: false });
    if (!userInteracted) {
      applyInitialViewport();
    }
  }

  function overlapArea(a, b) {
    var w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h;
  }

  function labelBox(point, name, candidate) {
    var width = Math.max(50, name.length * 7.1 + 18);
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

  function distancePenalty(candidate) {
    return Math.abs(candidate.dx) * 1.8 + Math.abs(candidate.dy) * 2.1;
  }

  function markerOverlapPenalty(box, point) {
    var markerBox = {
      left: point.x - 11,
      right: point.x + 11,
      top: point.y - 10,
      bottom: point.y + 10
    };
    return overlapArea(box, markerBox) * 6;
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
      className: "map-label",
      pane: record.priority ? "legoTooltipTop" : "tooltipPane"
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
        var score = overlap * 3
          + overflowPenalty(box, size)
          + distancePenalty(candidate)
          + markerOverlapPenalty(box, point);
        if (candidate.direction === "bottom") score += 10;
        if (candidate.direction !== "top") score += 4;
        if (score < bestScore) {
          bestScore = score;
          bestOverlap = overlap;
          best = candidate;
        }
      });

      var hide = !record.priority && bestOverlap > 180;
      bindLabel(record, best, hide);
      if (!hide) {
        placed.push(labelBox(point, record.place.name, best));
      }
    });
  }

  applyInitialViewport();
  layoutLabels();

  map.on("click", function () {
    if (!pinnedMarker) return;
    var markerToClose = pinnedMarker;
    pinnedMarker = null;
    markerToClose.closePopup();
  });
  map.on("zoomend moveend", layoutLabels);
  map.on("movestart zoomstart", function () {
    userInteracted = true;
  });

  window.addEventListener("load", function () {
    setTimeout(syncMapSize, 120);
    setTimeout(syncMapSize, 320);
  });

  window.addEventListener("resize", syncMapSize);
  window.addEventListener("orientationchange", function () {
    setTimeout(syncMapSize, 180);
  });
})();
