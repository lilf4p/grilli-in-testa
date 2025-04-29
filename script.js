// Ensure FontAwesome is loaded for social icons
const script = document.createElement('script');
script.src = 'https://kit.fontawesome.com/a076d05399.js';
script.crossOrigin = 'anonymous';
document.head.appendChild(script);

// Fetch content from API and update page elements
function fetchAndUpdateContent() {
	const requestOptions = {
		method: "GET",
		redirect: "follow"
	};

	fetch("http://localhost:1337/api/about?populate=*", requestOptions)
		.then((response) => response.json())
		.then((result) => {
			console.log("API data received:", result);
			// Check the exact structure of the response
			if (result && result.data && result.data) {
				updatePageContent(result.data);
			}
		})
		.catch((error) => console.error("Error fetching content:", error));
}

// Update page content with data from API
function updatePageContent(content) {
	console.log("Updating content with:", content);

	// Update main headline if available
	if (content.title) {
		const mainHeading = document.querySelector('.hero h1');
		if (mainHeading) {
			console.log("Updating main heading to:", content.title);
			mainHeading.textContent = content.title;
		} else {
			console.log("Main heading element not found");
		}
	}

	// Update hero description if available
	if (content.description) {
		const heroDesc = document.querySelector('.hero p');
		if (heroDesc) {
			console.log("Updating description to:", content.description);
			heroDesc.textContent = content.description;
		} else {
			console.log("Description element not found");
		}
	}

	// The rest of the function remains the same
	// This can be expanded based on what data is available in the API
}

// News page search and sort functionality
function initNewsFilters() {
	const searchInput = document.querySelector('.search-input');
	const sortSelect = document.querySelector('.sort-select');
	const newsCards = document.querySelectorAll('.news-card');

	if (!searchInput || !sortSelect || newsCards.length === 0) return;

	console.log('Initializing news filters');

	// Function to parse Italian dates (format: "10 Novembre 2023")
	function parseItalianDate(dateString) {
		// Extract the date from the string format "10 Novembre 2023"
		const dateText = dateString.replace(/[^\w\s]/g, '').trim(); // Remove icons and other non-word chars
		const parts = dateText.split(' ');

		if (parts.length < 3) return new Date(0); // Invalid date

		const day = parseInt(parts[parts.length - 3]);
		const monthName = parts[parts.length - 2].toLowerCase();
		const year = parseInt(parts[parts.length - 1]);

		// Map Italian month names to numbers
		const monthMap = {
			'gennaio': 0,
			'febbraio': 1,
			'marzo': 2,
			'aprile': 3,
			'maggio': 4,
			'giugno': 5,
			'luglio': 6,
			'agosto': 7,
			'settembre': 8,
			'ottobre': 9,
			'novembre': 10,
			'dicembre': 11
		};

		const month = monthMap[monthName] || 0;

		return new Date(year, month, day);
	}

	// Function to filter news items
	function filterNews() {
		const searchTerm = searchInput.value.toLowerCase().trim();
		const sortMethod = sortSelect.value;

		// Convert NodeList to Array for easier sorting
		const newsArray = Array.from(newsCards);

		// Sort the news array based on selected option
		newsArray.sort((a, b) => {
			if (sortMethod === 'recent') {
				// Sort by date (most recent first)
				const dateA = parseItalianDate(a.querySelector('.news-date').textContent);
				const dateB = parseItalianDate(b.querySelector('.news-date').textContent);
				return dateB - dateA;
			} else if (sortMethod === 'oldest') {
				// Sort by date (oldest first)
				const dateA = parseItalianDate(a.querySelector('.news-date').textContent);
				const dateB = parseItalianDate(b.querySelector('.news-date').textContent);
				return dateA - dateB;
			} else if (sortMethod === 'title') {
				// Sort alphabetically by title
				const titleA = a.querySelector('h3').textContent.toLowerCase();
				const titleB = b.querySelector('h3').textContent.toLowerCase();
				return titleA.localeCompare(titleB);
			}
			return 0;
		});

		// Apply search filter and update visibility
		const newsGrid = document.querySelector('.news-grid');

		// Clear the grid
		while (newsGrid.firstChild) {
			newsGrid.removeChild(newsGrid.firstChild);
		}

		// Add filtered and sorted items back to the grid
		let hasVisibleItems = false;

		newsArray.forEach(card => {
			const title = card.querySelector('h3').textContent.toLowerCase();
			const content = card.querySelector('p').textContent.toLowerCase();
			const date = card.querySelector('.news-date').textContent.toLowerCase();

			if (title.includes(searchTerm) || content.includes(searchTerm) || date.includes(searchTerm) || searchTerm === '') {
				newsGrid.appendChild(card);
				hasVisibleItems = true;
			}
		});

		// If no items match the search, show a message
		if (!hasVisibleItems) {
			const noResults = document.createElement('div');
			noResults.className = 'no-results';
			noResults.textContent = 'Nessun risultato trovato per la ricerca.';
			newsGrid.appendChild(noResults);
		}
	}

	// Add event listeners
	searchInput.addEventListener('input', filterNews);
	sortSelect.addEventListener('change', filterNews);

	// Initial sort by default option
	filterNews();
}

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
	const internalLinks = document.querySelectorAll('a[href^="./"], a[href^="/"], a[href^="index.html"], a[href^="news.html"], a[href^="chi-siamo.html"], a[href^="diventa-socio.html"]');

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

// Historical figures carousel functionality
document.addEventListener("DOMContentLoaded", function () {
	const track = document.querySelector('.carousel-track');

	// Clone the cards to create a seamless infinite loop
	if (track) {
		const cards = Array.from(track.children);
		const clones = cards.map(card => card.cloneNode(true));

		clones.forEach(clone => {
			track.appendChild(clone);
		});

		// Pause animation on hover for better readability
		track.addEventListener('mouseenter', () => {
			track.style.animationPlayState = 'paused';
		});

		track.addEventListener('mouseleave', () => {
			track.style.animationPlayState = 'running';
		});
	}
});

// Testimonial slider functionality
document.addEventListener("DOMContentLoaded", function () {
	const track = document.getElementById('testimonial-track');

	if (track) {
		// Pausa animazione quando si passa sopra con il mouse
		track.addEventListener('mouseenter', () => {
			track.style.animationPlayState = 'paused';
		});

		track.addEventListener('mouseleave', () => {
			track.style.animationPlayState = 'running';
		});
	}
});

document.addEventListener('DOMContentLoaded', () => {
	w3IncludeHTML();

	// First wait for the included HTML elements to be loaded
	const checkIncludesLoaded = setInterval(() => {
		// If no more elements with w3-include-html attribute exist, all includes are loaded
		if (!document.querySelector('[w3-include-html]')) {
			clearInterval(checkIncludesLoaded);

			console.log('All HTML includes are loaded, initializing page...');

			// Initialize burger menu
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

			// Initialize page transitions
			initPageTransitions();

			// Now fetch content from API once everything else is loaded
			console.log('Fetching content from API...');
			fetchAndUpdateContent();

			// Initialize news page filters if we're on the news page
			initNewsFilters();

			// Handle page load transitions
			handlePageLoad();
		}
	}, 100);
});

// Handle transitions when navigating with browser back/forward buttons
window.addEventListener('pageshow', function (event) {
	// If navigating from cache (back button), run transition out animation
	if (event.persisted) {
		handlePageLoad();
	}
});