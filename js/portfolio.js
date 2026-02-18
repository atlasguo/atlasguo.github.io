(function ($) {
	"use strict"; // Start of use strict

	var siteIstotope = function () {
		var buildCategoryToggleRows = function () {
			var $grid = $('#portfolio-grid');
			var groupIndex = 0;

			$grid.find('.portfolio-category').each(function () {
				var $categoryRow = $(this);
				var $categoryTitle = $categoryRow.find('.category').first();
				if (!$categoryTitle.length) {
					return;
				}

				var headingId = $categoryTitle.attr('id') || ('category-group-' + groupIndex);
				var groupId = ('group-' + headingId).replace(/[^a-zA-Z0-9_-]/g, '-');
				groupIndex += 1;

				var labelText = $.trim($categoryTitle.text().replace(/—/g, '').replace(/--/g, ''));
				var buttonHtml = '' +
					'<button class="portfolio-preview-toggle portfolio-category-toggle" type="button" aria-expanded="true" data-category-group="' + groupId + '">' +
					'<span class="portfolio-preview-toggle-icon" aria-hidden="true"></span>' +
					labelText +
					'</button>';

				$categoryRow.attr('data-category-group', groupId);
				$categoryTitle.removeClass('category').empty().append(buttonHtml);

				var $cursor = $categoryRow.next();
				while ($cursor.length && !$cursor.hasClass('portfolio-category')) {
					$cursor.addClass('category-group-item').attr('data-category-group', groupId);
					$cursor = $cursor.next();
				}
			});
		};

		buildCategoryToggleRows();

		var selectedFilters = [];
		var searchQuery = '';
		var $filters = $('#filters');
		var $filtersLabel = $('#filters-label');
		var $resetFilter = $filters.find('a[data-filter="*"]');
		var $grid = $('#portfolio-grid');
		var $container = $('#portfolio-grid').isotope({
			itemSelector: '.portfolio-item',
			isFitWidth: true,
			layoutMode: 'fitRows'
		});
		var rowHeightSyncTimer = null;
		var isSyncingRowHeights = false;

		var syncRowCardHeights = function () {
			if (isSyncingRowHeights) {
				return;
			}
			isSyncingRowHeights = true;

			var $cards = $container.find('.portfolio-item').not('.portfolio-category, .lego-note-row');
			$cards.each(function () {
				var $card = $(this);
				var $link = $card.find('.portfolio-link').first();
				if ($link.length) {
					$card.css('--portfolio-shell-width', $link.outerWidth() + 'px');
				}
			});
			$cards.css('min-height', '');

			var rows = {};
			$cards.filter(function () {
				return $(this).css('display') !== 'none';
			}).each(function () {
				var top = Math.round(parseFloat($(this).css('top')) || 0);
				if (!rows[top]) {
					rows[top] = [];
				}
				rows[top].push(this);
			});

			var hasHeightChange = false;
			Object.keys(rows).forEach(function (rowKey) {
				var rowItems = rows[rowKey];
				var rowMaxHeight = 0;
				rowItems.forEach(function (elem) {
					rowMaxHeight = Math.max(rowMaxHeight, $(elem).outerHeight());
				});
				rowItems.forEach(function (elem) {
					var targetHeight = rowMaxHeight + 'px';
					if ($(elem).css('min-height') !== targetHeight) {
						$(elem).css('min-height', targetHeight);
						hasHeightChange = true;
					}
				});
			});

			if (hasHeightChange) {
				$container.isotope('layout');
			}
			isSyncingRowHeights = false;
		};

		var scheduleRowHeightSync = function () {
			clearTimeout(rowHeightSyncTimer);
			rowHeightSyncTimer = setTimeout(syncRowCardHeights, 0);
		};

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
					var $item = $(this);
					var isCollapsedGroupItem = $item.hasClass('is-category-collapsed');
					if (isCollapsedGroupItem) {
						return false;
					}

					if ($item.hasClass('portfolio-category')) {
						var hasActiveFilter = selectedFilters.length > 0;
						return !searchQuery && !hasActiveFilter;
					}

					var matchesFilter = selectedFilters.length === 0 ? true : selectedFilters.every(function (filterSelector) {
						return $(this).is(filterSelector);
					}.bind(this));
					return matchesFilter && matchesSearch(this);
				}
			});
		};

		var syncFilterState = function () {
			$filters.find('a[data-filter]').not($resetFilter).each(function () {
				var filterValue = $(this).attr('data-filter');
				var isActive = selectedFilters.indexOf(filterValue) !== -1;
				$(this).toggleClass('active', isActive).attr('aria-pressed', isActive ? 'true' : 'false');
			});
			var isResetActive = selectedFilters.length === 0;
			$resetFilter.toggleClass('active', isResetActive).attr('aria-pressed', isResetActive ? 'true' : 'false');
			$grid.toggleClass('has-active-filter', !isResetActive);
		};

		var resizeTimer = null;
		$(window).on('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () {
				$container.isotope({
					columnWidth: '.col-sm-3'
				});
				scheduleRowHeightSync();
			}, 100);
		});

		$container.on('arrangeComplete', function () {
			scheduleRowHeightSync();
		});

		applyFilters();
		syncFilterState();
		scheduleRowHeightSync();

		$filters.on('click', 'a', function (e) {
			e.preventDefault();
			var clickedFilter = $(this).attr('data-filter');
			if (!clickedFilter) {
				return;
			}

			if (clickedFilter === '*') {
				selectedFilters = [];
			} else {
				var existingIndex = selectedFilters.indexOf(clickedFilter);
				if (existingIndex === -1) {
					selectedFilters.push(clickedFilter);
				} else {
					selectedFilters.splice(existingIndex, 1);
				}
			}

			applyFilters();
			syncFilterState();
		});

		$('#portfolio-grid').on('click', '.portfolio-category-toggle', function () {
			var $toggle = $(this);
			var groupId = $toggle.attr('data-category-group');
			if (!groupId) {
				return;
			}

			var isExpanded = $toggle.attr('aria-expanded') !== 'false';
			var shouldExpand = !isExpanded;
			$toggle.attr('aria-expanded', shouldExpand ? 'true' : 'false');

			$('#portfolio-grid .category-group-item[data-category-group="' + groupId + '"]').toggleClass('is-category-collapsed', !shouldExpand);
			applyFilters();
			$container.isotope('layout');
			scheduleRowHeightSync();
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
			scheduleRowHeightSync();
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
