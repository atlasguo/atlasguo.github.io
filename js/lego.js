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
        mapTypeFilter = nextFilter;
      } else if (group === 'medium') {
        mediumFilter = nextFilter;
      } else {
        mapTypeFilter = nextFilter;
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
