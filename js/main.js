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
		var isSmallScreen = window.matchMedia('(max-width: 991.98px)').matches;
		if (isSmallScreen) {
			$("#mainNav").removeClass("navbar-shrink");
			return;
		}

		if ($(window).scrollTop() > 10) {
			$("#mainNav").addClass("navbar-shrink");
		} else {
			$("#mainNav").removeClass("navbar-shrink");
		}
	};
	// Collapse now if page is not at top
	navbarCollapse();
	// Update navbar state on scroll and resize
	$(window).on('scroll resize', navbarCollapse);

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


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		document.querySelector(this.getAttribute('href')).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
});

(function () {
	"use strict";

	const SVG_NS = "http://www.w3.org/2000/svg";
	const XLINK_NS = "http://www.w3.org/1999/xlink";
	const hotspotCache = new Map();

	function ensureHotspotTooltip(container) {
		let tooltip = container.querySelector(".hexagon-hotspot-tooltip");
		if (tooltip) {
			return tooltip;
		}

		tooltip = document.createElement("div");
		tooltip.className = "hexagon-hotspot-tooltip";
		container.appendChild(tooltip);
		return tooltip;
	}

	function placeTooltip(container, tooltip, x, y) {
		const rect = container.getBoundingClientRect();
		const clampedX = Math.max(20, Math.min(rect.width - 20, x));
		const clampedY = Math.max(20, Math.min(rect.height - 20, y));
		tooltip.style.left = `${clampedX}px`;
		tooltip.style.top = `${clampedY}px`;
	}

	function showTooltip(tooltip, label) {
		tooltip.textContent = label || "Portfolio map";
		tooltip.classList.add("is-visible");
	}

	function hideTooltip(tooltip) {
		tooltip.classList.remove("is-visible");
	}

	function ensureDimLayer(overlay) {
		let dimLayer = overlay.querySelector(".hexagon-dim-layer");
		if (dimLayer) {
			return dimLayer;
		}

		dimLayer = document.createElementNS(SVG_NS, "path");
		dimLayer.setAttribute("class", "hexagon-dim-layer");
		dimLayer.setAttribute("fill-rule", "evenodd");
		overlay.insertBefore(dimLayer, overlay.firstChild);
		return dimLayer;
	}

	function pointsToPath(points) {
		if (!Array.isArray(points) || points.length < 3) {
			return "";
		}

		return points
			.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
			.join(" ") + " Z";
	}

	function showDimLayer(container, overlay, points) {
		const dimLayer = ensureDimLayer(overlay);
		const viewBox = overlay.viewBox.baseVal;
		if (!viewBox || !viewBox.width || !viewBox.height) {
			return;
		}

		const x = viewBox.x;
		const y = viewBox.y;
		const width = viewBox.width;
		const height = viewBox.height;
		const polygonPath = pointsToPath(points);
		if (!polygonPath) {
			return;
		}

		const rectPath = `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
		dimLayer.setAttribute("d", `${rectPath} ${polygonPath}`);
		container.classList.add("is-dimmed");
	}

	function hideDimLayer(container) {
		container.classList.remove("is-dimmed");
	}

	function bindHotspotTooltip(container, overlay, linkEl, points) {
		const tooltip = ensureHotspotTooltip(container);
		const label = linkEl.getAttribute("data-hotspot-title") || "Portfolio map";

		linkEl.addEventListener("mouseenter", (event) => {
			showDimLayer(container, overlay, points);
			const rect = container.getBoundingClientRect();
			placeTooltip(container, tooltip, event.clientX - rect.left, event.clientY - rect.top);
			showTooltip(tooltip, label);
		});

		linkEl.addEventListener("mousemove", (event) => {
			if (!tooltip.classList.contains("is-visible")) {
				return;
			}
			const rect = container.getBoundingClientRect();
			placeTooltip(container, tooltip, event.clientX - rect.left, event.clientY - rect.top);
		});

		linkEl.addEventListener("mouseleave", () => {
			hideDimLayer(container);
			hideTooltip(tooltip);
		});

		linkEl.addEventListener("focus", () => {
			showDimLayer(container, overlay, points);
			const polygonEl = linkEl.querySelector(".hexagon-hotspot");
			if (!polygonEl) {
				showTooltip(tooltip, label);
				return;
			}

			const bbox = polygonEl.getBBox();
			const viewBox = overlay.viewBox.baseVal;
			const overlayRect = overlay.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			if (!viewBox || !overlayRect.width || !overlayRect.height) {
				showTooltip(tooltip, label);
				return;
			}

			const centerX = bbox.x + bbox.width / 2;
			const centerY = bbox.y + bbox.height / 2;
			const xRatio = (centerX - viewBox.x) / viewBox.width;
			const yRatio = (centerY - viewBox.y) / viewBox.height;
			const xPx = (overlayRect.left - containerRect.left) + xRatio * overlayRect.width;
			const yPx = (overlayRect.top - containerRect.top) + yRatio * overlayRect.height;
			placeTooltip(container, tooltip, xPx, yPx);
			showTooltip(tooltip, label);
		});

		linkEl.addEventListener("blur", () => {
			hideDimLayer(container);
			hideTooltip(tooltip);
		});
	}

	function initPortfolioHexagonHotspots(hotspotLayer, configuredHotspots) {
		if (!hotspotLayer) {
			return;
		}

		const overlay = hotspotLayer.closest("svg");
		if (!overlay) {
			return;
		}
		const container = overlay.closest(".hexagon-map");
		if (!container) {
			return;
		}

		const safeHotspots = Array.isArray(configuredHotspots) ? configuredHotspots : [];
		if (!safeHotspots.length) {
			hotspotLayer.innerHTML = "";
			hideDimLayer(container);
			hideTooltip(ensureHotspotTooltip(container));
			return;
		}

		const fragment = document.createDocumentFragment();
		safeHotspots.forEach((hotspot) => {
			if (!hotspot || !hotspot.href || !Array.isArray(hotspot.points) || hotspot.points.length < 3) {
				return;
			}

			const linkEl = document.createElementNS(SVG_NS, "a");
			const hotspotTitle = (hotspot.title && String(hotspot.title).trim()) || "Portfolio map";
			linkEl.setAttribute("class", "hexagon-hotspot-link");
			linkEl.setAttribute("href", hotspot.href);
			linkEl.setAttributeNS(XLINK_NS, "xlink:href", hotspot.href);
			linkEl.setAttribute("target", hotspot.target || "_blank");
			linkEl.setAttribute("rel", "noopener noreferrer");
			linkEl.setAttribute("data-hotspot-title", hotspotTitle);

			const polygonEl = document.createElementNS(SVG_NS, "polygon");
			polygonEl.setAttribute("class", "hexagon-hotspot");
			polygonEl.setAttribute("points", hotspot.points.map((point) => `${point[0]},${point[1]}`).join(" "));
			polygonEl.setAttribute("aria-label", hotspotTitle);
			linkEl.appendChild(polygonEl);

			const titleEl = document.createElementNS(SVG_NS, "title");
			titleEl.textContent = hotspotTitle;
			linkEl.appendChild(titleEl);

			bindHotspotTooltip(container, overlay, linkEl, hotspot.points);
			fragment.appendChild(linkEl);
		});

		hotspotLayer.innerHTML = "";
		hotspotLayer.appendChild(fragment);
	}

	async function loadPortfolioHexagonHotspots(src) {
		if (!src) {
			return [];
		}

		if (hotspotCache.has(src)) {
			return hotspotCache.get(src);
		}

		if (Array.isArray(window.PORTFOLIO_HEXAGON_HOTSPOTS)) {
			return window.PORTFOLIO_HEXAGON_HOTSPOTS;
		}

		try {
			const response = await fetch(src);
			if (!response.ok) {
				hotspotCache.set(src, []);
				return [];
			}
			const payload = await response.json();
			const normalized = Array.isArray(payload) ? payload : [];
			hotspotCache.set(src, normalized);
			return normalized;
		} catch (error) {
			hotspotCache.set(src, []);
			return [];
		}
	}

	function enableHexagonDebug() {
		const shouldEnableDebug = new URLSearchParams(window.location.search).get("hexDebug") === "1";
		if (!shouldEnableDebug) {
			return;
		}

		document.querySelectorAll(".hexagon-map-overlay").forEach((overlay) => {
			overlay.classList.add("debug");
			overlay.addEventListener("click", (event) => {
				if (event.target.closest(".hexagon-hotspot-link")) {
					return;
				}

				const screenPoint = overlay.createSVGPoint();
				screenPoint.x = event.clientX;
				screenPoint.y = event.clientY;

				const matrix = overlay.getScreenCTM();
				if (!matrix) {
					return;
				}

				const svgPoint = screenPoint.matrixTransform(matrix.inverse());
				console.log(`[hexDebug] x=${svgPoint.x.toFixed(1)}, y=${svgPoint.y.toFixed(1)}`);
			});
		});
	}

	async function initAllPortfolioHexagonHotspots() {
		const mapContainers = document.querySelectorAll(".hexagon-map");
		const initTasks = Array.from(mapContainers).map(async (container) => {
			const src = container.getAttribute("data-hotspots-src");
			const hotspotLayer = container.querySelector(".hexagon-map-hotspots");
			if (!hotspotLayer) {
				return;
			}

			const hotspots = await loadPortfolioHexagonHotspots(src);
			initPortfolioHexagonHotspots(hotspotLayer, hotspots);
		});

		await Promise.all(initTasks);
		enableHexagonDebug();
	}

	initAllPortfolioHexagonHotspots().catch(() => {
		// Keep homepage usable even if hotspot initialization fails.
	});
})();
