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

// Create page transition element
function createPageTransitionElement() {
	const transitionEl = document.createElement('div');
	transitionEl.classList.add('page-transition');
	document.body.appendChild(transitionEl);
	return transitionEl;
}

// Handle page transitions
function initPageTransitions() {
	// Create the transition element if it doesn't exist
	let transitionEl = document.querySelector('.page-transition');
	if (!transitionEl) {
		transitionEl = createPageTransitionElement();
	}

	// Get all links that lead to internal pages
	const internalLinks = document.querySelectorAll('a[href^="./"], a[href^="/"], a[href^="index.html"], a[href^="spettacoli.html"], a[href^="corsi.html"], a[href^="news.html"], a[href^="chi-siamo.html"], a[href^="diventa-socio.html"]');

	// Add click event to each internal link
	internalLinks.forEach(link => {
		// Skip links that already have the event (for when this runs after w3IncludeHTML)
		if (link.dataset.hasTransition) return;

		link.dataset.hasTransition = true;
		link.addEventListener('click', function (e) {
			const href = this.getAttribute('href');

			// Skip if it's an anchor link on the same page
			if (href.startsWith('#')) return;

			e.preventDefault();
			document.body.classList.add('page-transitioning');

			// Start transition animation - sliding in from top
			transitionEl.classList.add('active');

			// Wait for animation to complete before navigating
			setTimeout(() => {
				window.location.href = href;
			}, 500); // This should match the CSS transition time
		});
	});
}

// Handle fade in of page content when page loads
function fadeInContent() {
	const mainContent = document.querySelector('main');
	if (mainContent) {
		// Delay to ensure CSS transitions work properly
		setTimeout(() => {
			mainContent.classList.add('loaded');
		}, 50);
	}
}

// Handle transition out animation when navigating back
function handlePageLoad() {
	// Create transition element if needed
	let transitionEl = document.querySelector('.page-transition');
	if (!transitionEl) {
		transitionEl = createPageTransitionElement();
		transitionEl.classList.add('active');
	}

	// Add fade-out class to transition out - sliding down
	setTimeout(() => {
		transitionEl.classList.add('fade-out');
		document.body.classList.remove('page-transitioning');

		// Remove classes after animation completes
		setTimeout(() => {
			transitionEl.classList.remove('active', 'fade-out');
		}, 500);
	}, 100);

	// Fade in the main content from top
	fadeInContent();
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
				document.body.classList.toggle('menu-open');
				console.log('Burger clicked, toggled active class');
			});
		} else {
			console.error('Burger menu or nav links not found');
		}

		// Initialize page transitions after navbar is loaded
		initPageTransitions();
	}, 500);

	// Handle page load transitions
	handlePageLoad();
});

// Handle transitions when navigating with browser back/forward buttons
window.addEventListener('pageshow', function (event) {
	// If navigating from cache (back button), run transition out animation
	if (event.persisted) {
		handlePageLoad();
	}
});