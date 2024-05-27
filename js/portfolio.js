(function ($) {
	"use strict"; // Start of use strict

	var siteIstotope = function () {

		var $container = $('#portfolio-grid').isotope({
			itemSelector: '.portfolio-item',
			isFitWidth: true,
			layoutMode: 'fitRows'
		});

		$(window).resize(function () {
			$container.isotope({
				columnWidth: '.col-sm-3'
			});
		});

		$container.isotope({ filter: '*' });

		$('#filters').on('click', 'a', function (e) {

			e.preventDefault();
			var filterValue = $(this).attr('data-filter');
			$container.isotope({ filter: filterValue });
			$('#filters a').removeClass('active');
			$(this).addClass('active');
		});
	}

	$(window).on('load', function () {
		siteIstotope();
	});

})(jQuery); // End of use strict