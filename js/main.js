(function ($) {
	"use strict"; // Start of use strict

	//Smooth scrolling using jQuery easing
	$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: (target.offset().top - 40)
				}, 400, "easeInOutExpo");
				return false;
			}
		}
	});

	// Closes responsive menu when a scroll trigger link is clicked
	$('.js-scroll-trigger').click(function () {
		$('.navbar-collapse').collapse('hide');
	});

	// Activate scrollspy to add active class to navbar items on scroll
	$('body').scrollspy({
		target: '#mainNav',
		offset: 100
	});

	// Collapse Navbar
	var navbarCollapse = function () {
		if ($("#mainNav").offset().top > 10) {
			$("#mainNav").addClass("navbar-shrink");
		} else {
			$("#mainNav").removeClass("navbar-shrink");
		}
	};
	// Collapse now if page is not at top
	navbarCollapse();
	// Collapse the navbar when page is scrolled
	$(window).scroll(navbarCollapse);

	// Hide navbar when modals trigger
	$('.portfolio-modal').on('show.bs.modal', function (e) {
		$('.navbar').addClass('d-none');
	})
	$('.portfolio-modal').on('hidden.bs.modal', function (e) {
		$('.navbar').removeClass('d-none');
	})

	// back to top button
	const backToTopButton = document.getElementById('backToTop');

	window.addEventListener('scroll', () => {
		if (window.scrollY > 200) {
			backToTopButton.style.display = 'block';
		} else {
			backToTopButton.style.display = 'none';
		}
	});

	backToTopButton.addEventListener('click', () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});


})(jQuery); // End of use strict



