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
	var widgetElement = document.getElementsByClassName('jvectormap-marker');
	if (widgetElement.length > 0) {
		widgetElement[0].setAttribute('r', '0');
	}

	var iframe = document.querySelector('iframe');
	console.log(iframe);
	if (iframe) {
		iframe.style.display = 'none';
		//iframe.id = 'myIframe'; // Assign an ID
		// Or assign a class
		// iframe.classList.add('myIframeClass');
	}

	console.log("Everything is loaded.")
};