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
    var currentFilter = '*';


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
      return currentFilter === '*' ? true : $item.is(currentFilter);
    };

    var syncFilterState = function () {
      if (!$filters.length) {
        return;
      }
      $filters.find('a[data-filter]').removeClass('active').attr('aria-pressed', 'false');
      $filters.find('a[data-filter="' + currentFilter + '"]').addClass('active').attr('aria-pressed', 'true');
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
      currentFilter = $(this).attr('data-filter') || '*';
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
