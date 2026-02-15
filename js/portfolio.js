(function ($) {
	"use strict"; // Start of use strict

	var siteIstotope = function () {
		var currentFilter = '*';
		var searchQuery = '';
		var $filters = $('#filters');
		var $filtersLabel = $('#filters-label');
		var $container = $('#portfolio-grid').isotope({
			itemSelector: '.portfolio-item',
			isFitWidth: true,
			layoutMode: 'fitRows'
		});

		var matchesSearch = function (itemElem) {
			if (!searchQuery) {
				return true;
			}

			var $caption = $(itemElem).find('.portfolio-caption');
			var isLegoNoteRow = $(itemElem).is('.lego-note-row') || $(itemElem).find('#lego-note').length > 0;
			if (!$caption.length && !isLegoNoteRow) {
				return false;
			}

			var itemText = $(itemElem).text();
			var tagKeywords = $(itemElem).attr('class')
				.split(' ')
				.filter(function (className) {
					return className.indexOf('tag_') === 0;
				})
				.map(function (className) {
					return className.replace('tag_', '').replace(/_/g, ' ');
				})
				.join(' ');
			var extraKeywords = $(itemElem).data('search') || '';
			var combinedText = (itemText + ' ' + tagKeywords + ' ' + extraKeywords).toLowerCase();
			return combinedText.indexOf(searchQuery) !== -1;
		};

		var applyFilters = function () {
			$container.isotope({
				filter: function () {
					var matchesFilter = currentFilter === '*' ? true : $(this).is(currentFilter);
					return matchesFilter && matchesSearch(this);
				}
			});
		};

		var resizeTimer = null;
		$(window).on('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () {
				$container.isotope({
					columnWidth: '.col-sm-3'
				});
			}, 100);
		});

		applyFilters();

		$filters.on('click', 'a', function (e) {
			e.preventDefault();
			currentFilter = $(this).attr('data-filter');
			applyFilters();
			$filters.find('a').removeClass('active');
			$(this).addClass('active');
		});

		var $searchInput = $('#portfolio-search');
		var $searchWrap = $searchInput.closest('.portfolio-search');
		var $searchClear = $('#portfolio-search-clear');

		$searchInput.on('input', function () {
			searchQuery = $(this).val().trim().toLowerCase();
			var hasSearch = searchQuery.length > 0;
			$searchWrap.toggleClass('has-value', hasSearch);
			$filters.add($filtersLabel).toggleClass('is-hidden', hasSearch);
			applyFilters();
		});

		$searchClear.on('click', function () {
			$searchInput.val('');
			$searchInput.trigger('input');
			$searchInput.focus();
		});
		return $container;
	};

	$(function () {
		var $portfolioContainer = siteIstotope();

		$(window).on('load', function () {
			if ($portfolioContainer && $portfolioContainer.data('isotope')) {
				$portfolioContainer.isotope('layout');
			}
		});
	});

})(jQuery); // End of use strict
