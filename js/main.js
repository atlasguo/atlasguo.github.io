document.addEventListener("DOMContentLoaded", function () {
	// Fetch and load external HTML content
	fetch("html/portfolio.html")
		.then(response => response.text())
		.then(data => {
			document.getElementById("portfolio-detail").innerHTML = data;
			//console.log("Portfolio html file is loaded.")
		});
});

window.onload = function () {

	$(document).ready(function () {

		$('.jvectormap-marker').css('display', 'none');
		$('#mapmyvisitors-widget').removeAttr('href').css({
			'cursor': 'default'
		});
		//$('#mapmyvisitors-widget').hide();

		$('iframe').removeAttr('href').css({
			'cursor': 'default'
		});
		//$('iframe').hide();
	});

	console.log("Everything is loaded.")
};

