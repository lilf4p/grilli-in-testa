// Ensure FontAwesome is loaded for social icons
const script = document.createElement('script');
script.src = 'https://kit.fontawesome.com/a076d05399.js';
script.crossOrigin = 'anonymous';
document.head.appendChild(script);

function w3IncludeHTML() {
	var z, i, elmnt, file, xhttp;
	/* Loop through a collection of all HTML elements: */
	z = document.getElementsByTagName("*");
	for (i = 0; i < z.length; i++) {
		elmnt = z[i];
		/*search for elements with a certain atrribute:*/
		file = elmnt.getAttribute("w3-include-html");
		if (file) {
			/* Make an HTTP request using the attribute value as the file name: */
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4) {
					if (this.status == 200) { elmnt.innerHTML = this.responseText; }
					if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
					/* Remove the attribute, and call this function once more: */
					elmnt.removeAttribute("w3-include-html");
					w3IncludeHTML();
				}
			}
			xhttp.open("GET", file, true);
			xhttp.send();
			/* Exit the function: */
			return;
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	w3IncludeHTML();

	// Wait a moment for the included HTML to load
	setTimeout(() => {
		// Ensure the navbar toggle functionality is initialized
		const burger = document.querySelector('.burger');
		const navLinks = document.querySelector('.nav-links');

		if (burger && navLinks) {
			burger.addEventListener('click', () => {
				navLinks.classList.toggle('active');
				console.log('Burger clicked, toggled active class');
			});
		} else {
			console.error('Burger menu or nav links not found');
		}
	}, 500);
});