// Ensure FontAwesome is loaded for social icons
const script = document.createElement('script');
script.src = 'https://kit.fontawesome.com/a076d05399.js';
script.crossOrigin = 'anonymous';
document.head.appendChild(script);

// API URL configuration
const API_BASE_URL = 'http://localhost:1337';
const API_ARTICLES_ENDPOINT = '/api/articles?populate=*';
const API_EVENTS_ENDPOINT = '/api/events?populate=*';

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

// Fetch articles from API
function fetchArticles() {
	if (!document.querySelector('.news-page')) return;

	console.log('Fetching articles from API...');
	const requestOptions = {
		method: "GET",
		redirect: "follow"
	};

	fetch(API_BASE_URL + API_ARTICLES_ENDPOINT, requestOptions)
		.then(response => response.json())
		.then(result => {
			console.log("Articles data received:", result);
			if (result && result.data && Array.isArray(result.data)) {
				displayArticles(result.data);
			}
		})
		.catch(error => console.error("Error fetching articles:", error));
}

// Format the date to Italian format
function formatDateToItalian(dateString) {
	const date = new Date(dateString);
	const day = date.getDate();
	const month = date.getMonth();
	const year = date.getFullYear();

	const monthNames = [
		'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
		'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
	];

	return `${day} ${monthNames[month]} ${year}`;
}

// Display articles in the news page
function displayArticles(articles) {
	const newsGrid = document.querySelector('.news-grid');
	if (!newsGrid) return;

	// Clear existing content
	newsGrid.innerHTML = '';

	// Sort articles by date (newest first)
	articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

	articles.forEach(article => {
		const imageUrl = article.cover && article.cover.formats ?
			API_BASE_URL + article.cover.formats.medium.url :
			'assets/placeholder-news.jpg';

		const publishDate = formatDateToItalian(article.publishedAt);
		const articleSlug = article.slug;

		const articleElement = document.createElement('article');
		articleElement.className = 'news-card';
		articleElement.innerHTML = `
            <div class="news-image">
                <img src="${imageUrl}" alt="${article.title}">
            </div>
            <div class="news-content">
                <span class="news-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <a href="news-articles/article.html?slug=${articleSlug}" class="read-more">Leggi tutto <i class="fas fa-arrow-right"></i></a>
            </div>
        `;

		newsGrid.appendChild(articleElement);
	});

	// Initialize news filters after populating articles
	initNewsFilters();
}

// Fetch and display a single article
function fetchAndDisplaySingleArticle() {
	// Check if we're on the article page
	if (!window.location.pathname.includes('article.html')) return;

	// Get the slug from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	const slug = urlParams.get('slug');

	if (!slug) {
		console.error('No article slug provided in URL');
		document.querySelector('main').innerHTML = '<div class="error-message">Articolo non trovato</div>';
		return;
	}

	console.log('Fetching article with slug:', slug);
	const requestOptions = {
		method: "GET",
		redirect: "follow"
	};

	fetch(`${API_BASE_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`, requestOptions)
		.then(response => response.json())
		.then(result => {
			console.log("Single article data received:", result);
			if (result && result.data && result.data.length > 0) {
				displaySingleArticle(result.data[0]);
			} else {
				document.querySelector('main').innerHTML = '<div class="error-message">Articolo non trovato</div>';
			}
		})
		.catch(error => console.error("Error fetching article:", error));
}

// Display a single article
function displaySingleArticle(article) {
	const mainContent = document.querySelector('main');
	if (!mainContent) return;

	const imageUrl = article.cover && article.cover.formats ?
		API_BASE_URL + article.cover.formats.large.url :
		'../assets/placeholder-news.jpg';

	const publishDate = formatDateToItalian(article.publishedAt);

	// Create the article content
	const articleContent = document.createElement('div');
	articleContent.className = 'article-container';

	articleContent.innerHTML = `
        <div class="article-header">
            <h1>${article.title}</h1>
            <div class="article-meta">
                <span class="article-date"><i class="far fa-calendar-alt"></i> ${publishDate}</span>
                ${article.author ? `<span class="article-author"><i class="far fa-user"></i> ${article.author.name}</span>` : ''}
                ${article.category ? `<span class="article-category"><i class="far fa-folder"></i> ${article.category.name}</span>` : ''}
            </div>
        </div>

        <div class="article-featured-image">
            <img src="${imageUrl}" alt="${article.title}">
        </div>

        <div class="article-body">
            <p class="article-description">${article.description}</p>
            <div class="article-content"></div>
        </div>

        <div class="article-footer">
            <a href="../news.html" class="back-button"><i class="fas fa-arrow-left"></i> Torna alle News</a>
        </div>
    `;

	mainContent.innerHTML = '';
	mainContent.appendChild(articleContent);

	// Process blocks if available
	const contentContainer = articleContent.querySelector('.article-content');
	if (article.blocks && article.blocks.length > 0 && contentContainer) {
		article.blocks.forEach(block => {
			if (block.__component === 'shared.rich-text' && block.body) {
				const textDiv = document.createElement('div');
				textDiv.className = 'rich-text-block';
				textDiv.innerHTML = markdownToHtml(block.body);
				contentContainer.appendChild(textDiv);
			} else if (block.__component === 'shared.quote' && block.body) {
				const quoteDiv = document.createElement('blockquote');
				quoteDiv.className = 'quote-block';
				quoteDiv.innerHTML = `
                    <p>"${block.body}"</p>
                    ${block.title ? `<footer>— ${block.title}</footer>` : ''}
                `;
				contentContainer.appendChild(quoteDiv);
			}
		});
	}
}

// Simple Markdown to HTML converter for basic formatting
function markdownToHtml(markdown) {
	if (!markdown) return '';

	// Headers
	let html = markdown
		.replace(/## (.*)/g, '<h2>$1</h2>')
		.replace(/### (.*)/g, '<h3>$1</h3>')

		// Bold and italic
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')

		// Lists
		.replace(/^\s*- (.*)/gm, '<li>$1</li>')

		// Links
		.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

		// Paragraphs
		.replace(/\n\n/g, '</p><p>');

	// Wrap with paragraph tags if not starting with an HTML tag
	if (!/^<\w+>/.test(html)) {
		html = `<p>${html}</p>`;
	}

	// Fix lists
	html = html.replace(/<li>.*?<\/li>/g, match => {
		return '<ul>' + match + '</ul>';
	});

	return html;
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

			// Fetch articles for news page
			fetchArticles();

			// Fetch events for events page
			fetchEvents();

			// Fetch events for homepage
			fetchHomeEvents();

			// Handle single article page if needed
			fetchAndDisplaySingleArticle();

			// Initialize news page filters if we're on the news page
			// Moved into displayArticles function after loading articles

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

// Fetch events from API
function fetchEvents() {
	if (!document.querySelector('.events-page')) return;

	console.log('Fetching events from API...');
	const requestOptions = {
		method: "GET",
		redirect: "follow"
	};

	fetch(API_BASE_URL + API_EVENTS_ENDPOINT, requestOptions)
		.then(response => response.json())
		.then(result => {
			console.log("Events data received:", result);
			if (result && result.data && Array.isArray(result.data)) {
				displayEvents(result.data);
				// Initialize event filters after loading events
				initEventFilters();
			}
		})
		.catch(error => console.error("Error fetching events:", error));
}

// Display events in the events page
function displayEvents(events) {
	const eventsList = document.querySelector('.events-list');
	if (!eventsList) return;

	// Clear existing content
	eventsList.innerHTML = '';

	// Store events globally for filtering
	window.allEvents = events;

	// Check if there are any events
	if (events.length === 0) {
		eventsList.innerHTML = '<div class="no-events">Nessun evento trovato</div>';
		return;
	}

	// Sort events by date (newest first)
	events.sort((a, b) => new Date(b.Date || b.publishedAt) - new Date(a.Date || a.publishedAt));

	// Add each event to the page
	events.forEach(event => {
		createAndAppendEventCard(event, eventsList);
	});
}

// Create and append an event card to the DOM
function createAndAppendEventCard(event, container) {
	// Default image if no cover available
	let imageUrl = 'assets/placeholder-performance.jpg';

	// Check if the event has a cover image
	if (event.Cover && event.Cover.formats) {
		// Use medium format if available, otherwise use the available format
		imageUrl = API_BASE_URL + (event.Cover.formats.medium ? event.Cover.formats.medium.url : event.Cover.url);
	}

	// Format date in Italian
	const eventDate = event.Date ? formatDateToItalian(event.Date) : formatDateToItalian(event.publishedAt);

	// Determine if the event is in the past
	const isEventPast = new Date(event.Date || event.publishedAt) < new Date();

	// Get event season (academic year) based on date
	const eventSeason = getEventSeason(new Date(event.Date || event.publishedAt));

	// Create event card element
	const eventElement = document.createElement('article');
	eventElement.className = 'event-card';
	if (isEventPast) {
		eventElement.classList.add('past-event');
	}

	// Add data attributes for filtering
	eventElement.dataset.status = isEventPast ? 'past' : 'upcoming';
	eventElement.dataset.season = eventSeason;

	eventElement.innerHTML = `
		<div class="event-image">
			<img src="${imageUrl}" alt="${event.Title}">
		</div>
		<div class="event-info">
			<h3>${event.Title}</h3>
			<p class="event-date"><i class="far fa-calendar-alt"></i> ${eventDate}</p>
			${event.Time ? `<p class="event-time"><i class="far fa-clock"></i> ${event.Time}</p>` : ''}
			<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.Place || 'Luogo da definire'}</p>
			<p class="event-description">
				${event.Description}
			</p>
			${isEventPast ?
			'<a href="#" class="cta-concluso">Evento Concluso</a>' :
			'<a href="#" class="cta">Prenota Posto</a>'
		}
		</div>
	`;

	container.appendChild(eventElement);
}

// Determine the academic year/season for an event based on its date
function getEventSeason(date) {
	const year = date.getFullYear();
	const month = date.getMonth();

	// If month is between September and December, it's year/year+1 season
	// Otherwise it's year-1/year season
	if (month >= 8) { // September (8) to December
		return `${year}-${year + 1}`;
	} else {
		return `${year - 1}-${year}`;
	}
}

// Initialize events filters
function initEventFilters() {
	console.log('Initializing event filters');

	// Get filter elements
	const searchInput = document.getElementById('event-search');
	const searchButton = document.getElementById('search-btn');
	const statusFilter = document.getElementById('event-status-filter');
	const seasonFilter = document.getElementById('season-filter');

	// If critical elements are missing, return
	if (!searchInput || !statusFilter || !seasonFilter) {
		console.error('Filter elements not found on the page');
		return;
	}

	// Event listeners for search
	searchInput.addEventListener('input', filterEvents);
	if (searchButton) {
		searchButton.addEventListener('click', (e) => {
			e.preventDefault();
			filterEvents();
		});
	}

	// Also filter when dropdowns change
	statusFilter.addEventListener('change', filterEvents);
	seasonFilter.addEventListener('change', filterEvents);

	// Initial filtering (shows all events)
	filterEvents();

	console.log('Event filters initialized successfully');
}

// Filter events based on search input and filter selections
function filterEvents() {
	// Get search and filter values
	const searchInput = document.getElementById('event-search');
	const statusFilter = document.getElementById('event-status-filter');
	const seasonFilter = document.getElementById('season-filter');

	const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
	const statusValue = statusFilter ? statusFilter.value : 'all';
	const seasonValue = seasonFilter ? seasonFilter.value : 'all';

	// Get all events from global storage
	const events = window.allEvents || [];

	// Filter events based on criteria
	const filteredEvents = events.filter(event => {
		// Search term filtering
		const title = event.Title ? event.Title.toLowerCase() : '';
		const description = event.Description ? event.Description.toLowerCase() : '';
		const location = event.Place ? event.Place.toLowerCase() : '';

		const matchesSearch = !searchTerm ||
			title.includes(searchTerm) ||
			description.includes(searchTerm) ||
			location.includes(searchTerm);

		// Status filtering (past/upcoming)
		const isEventPast = new Date(event.Date || event.publishedAt) < new Date();
		const matchesStatus = statusValue === 'all' ||
			(statusValue === 'past' && isEventPast) ||
			(statusValue === 'upcoming' && !isEventPast);

		// Season filtering
		const eventSeason = getEventSeason(new Date(event.Date || event.publishedAt));
		const matchesSeason = seasonValue === 'all' || seasonValue === eventSeason;

		// Return true only if all criteria match
		return matchesSearch && matchesStatus && matchesSeason;
	});

	// Display filtered events
	displayFilteredEvents(filteredEvents);
}

// Display filtered events
function displayFilteredEvents(filteredEvents) {
	const eventsList = document.querySelector('.events-list');
	const noResultsSection = document.querySelector('.no-results');

	if (!eventsList) return;

	// Clear current events
	eventsList.innerHTML = '';

	// If no events match, display the no results message
	if (filteredEvents.length === 0) {
		if (noResultsSection) {
			noResultsSection.style.display = 'block';
		}
		return;
	}

	// Hide no results message if we have results
	if (noResultsSection) {
		noResultsSection.style.display = 'none';
	}

	// Re-sort filtered events by date
	filteredEvents.sort((a, b) => new Date(b.Date || b.publishedAt) - new Date(a.Date || a.publishedAt));

	// Add filtered events to the list
	filteredEvents.forEach(event => {
		createAndAppendEventCard(event, eventsList);
	});
}

// Fetch and display upcoming events on the homepage
function fetchHomeEvents() {
	const homeEventsSlider = document.getElementById('home-events-slider');
	if (!homeEventsSlider) return;

	console.log('Fetching events for homepage...');
	const requestOptions = {
		method: "GET",
		redirect: "follow"
	};

	fetch(API_BASE_URL + API_EVENTS_ENDPOINT, requestOptions)
		.then(response => response.json())
		.then(result => {
			console.log("Events data received for homepage:", result);
			if (result && result.data && Array.isArray(result.data)) {
				displayHomeEvents(result.data);
			}
		})
		.catch(error => console.error("Error fetching events for homepage:", error));
}

// Display only upcoming events on the homepage
function displayHomeEvents(events) {
	const eventsSlider = document.getElementById('home-events-slider');
	if (!eventsSlider) return;

	// Clear loading indicator
	eventsSlider.innerHTML = '';

	// Filter to get only future events (date is in the future)
	const currentDate = new Date();
	const upcomingEvents = events.filter(event => {
		const eventDate = new Date(event.Date || event.publishedAt);
		return eventDate > currentDate;
	});

	// Sort by nearest date first
	upcomingEvents.sort((a, b) => new Date(a.Date || a.publishedAt) - new Date(b.Date || b.publishedAt));

	// Limit to 3 events for the homepage
	const eventsToShow = upcomingEvents.slice(0, 3);

	// Check if there are any upcoming events
	if (eventsToShow.length === 0) {
		eventsSlider.innerHTML = '<div class="no-events">Nessun evento programmato al momento. <a href="eventi.html">Scopri gli eventi passati</a>.</div>';
		return;
	}

	// Create a container for the events
	const eventsContainer = document.createElement('div');
	eventsContainer.className = 'home-events-container';

	// Add each event to the slider
	eventsToShow.forEach(event => {
		// Default image if no cover available
		let imageUrl = 'assets/placeholder-performance.jpg';

		// Check if the event has a cover image
		if (event.Cover && event.Cover.formats) {
			// Use medium format if available, otherwise use the available format
			imageUrl = API_BASE_URL + (event.Cover.formats.medium ? event.Cover.formats.medium.url : event.Cover.url);
		}

		// Format date in Italian
		const eventDate = event.Date ? formatDateToItalian(event.Date) : formatDateToItalian(event.publishedAt);

		// Create event card element
		const eventCard = document.createElement('div');
		eventCard.className = 'home-event-card';
		eventCard.innerHTML = `
			<div class="event-image">
				<img src="${imageUrl}" alt="${event.Title}">
			</div>
			<div class="event-info">
				<h3>${event.Title}</h3>
				<p class="event-date"><i class="far fa-calendar-alt"></i> ${eventDate}</p>
				${event.Time ? `<p class="event-time"><i class="far fa-clock"></i> ${event.Time}</p>` : ''}
				<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.Place || 'Luogo da definire'}</p>
				<a href="eventi.html#event-${event.id}" class="cta-small">Maggiori info</a>
			</div>
		`;

		eventsContainer.appendChild(eventCard);
	});

	// Add a "View All" button
	const viewAllButton = document.createElement('div');
	viewAllButton.className = 'view-all-button';
	viewAllButton.innerHTML = '<a href="eventi.html" class="cta">Vedi tutti gli eventi</a>';

	// Add elements to the slider
	eventsSlider.appendChild(eventsContainer);
	eventsSlider.appendChild(viewAllButton);
}