document.addEventListener("DOMContentLoaded", function () {
	// Fetch and load external HTML content
	fetch("portfolio.html")
		.then(response => response.text())
		.then(data => {
			document.getElementById("portfolio-detail").innerHTML = data;
		});
});