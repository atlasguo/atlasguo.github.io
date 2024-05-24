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
	var widgetElement = document.getElementById('mapmyvisitors-widget');
	if (widgetElement) {
		widgetElement.style.display = 'none';
	}
	console.log("Everything is loaded.")
};