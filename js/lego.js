(function ($) {
  "use strict";

  var setupLegoSearch = function () {
    var $searchInput = $('#lego-search');
    if (!$searchInput.length) {
      return;
    }

    var $searchWrap = $searchInput.closest('.portfolio-search');
    var $searchClear = $('#lego-search-clear');
    var $intro = $('#lego-intro');
    var $outro = $('#lego-outro');
    var $items = $('.portfolio-item');

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

    var applySearch = function () {
      var query = $searchInput.val().trim().toLowerCase();
      var hasSearch = query.length > 0;

      $searchWrap.toggleClass('has-value', hasSearch);
      $intro.toggleClass('is-hidden', hasSearch);
      $outro.toggleClass('is-hidden', hasSearch);

      $items.each(function () {
        var $item = $(this);
        $item.toggleClass('is-hidden', !matchesSearch($item, query));
      });
    };

    $searchInput.on('input', applySearch);

    $searchClear.on('click', function () {
      $searchInput.val('');
      applySearch();
      $searchInput.focus();
    });
  };

  $(window).on('load', function () {
    setupLegoSearch();
  });
})(jQuery);
