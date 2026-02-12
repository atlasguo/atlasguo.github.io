(function ($) {
	"use strict"; // Start of use strict

	var siteIstotope = function () {
		var currentFilter = '*';
		var searchQuery = '';
		var $container = $('#portfolio-grid').isotope({
			itemSelector: '.portfolio-item',
			isFitWidth: true,
			layoutMode: 'fitRows'
		});
		var hideLegoNoteByFilter = false;

		var matchesSearch = function (itemElem) {
			if (!searchQuery) {
				return true;
			}

			var $caption = $(itemElem).find('.portfolio-caption');
			if (!$caption.length) {
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

		$(window).resize(function () {
			$container.isotope({
				columnWidth: '.col-sm-3'
			});
		});

		applyFilters();

		$('#filters').on('click', 'a', function (e) {
			e.preventDefault();
			currentFilter = $(this).attr('data-filter');
			applyFilters();
			$('#filters a').removeClass('active');
			$(this).addClass('active');
			hideLegoNoteByFilter = true;
			$('#lego-note').addClass('is-hidden');
		});

		var $searchInput = $('#portfolio-search');
		var $searchWrap = $searchInput.closest('.portfolio-search');
		var $searchClear = $('#portfolio-search-clear');

		$searchInput.on('input', function () {
			searchQuery = $(this).val().trim().toLowerCase();
			var hasSearch = searchQuery.length > 0;
			$searchWrap.toggleClass('has-value', hasSearch);
			$('#filters, #filters-label').toggleClass('is-hidden', hasSearch);
			$('#lego-note').toggleClass('is-hidden', hasSearch || hideLegoNoteByFilter);
			applyFilters();
		});

		$searchClear.on('click', function () {
			$searchInput.val('');
			$searchInput.trigger('input');
			$searchInput.focus();
		});
	}

	$(window).on('load', function () {
		siteIstotope();
	});

})(jQuery); // End of use strict