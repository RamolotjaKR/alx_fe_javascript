// Sync quotes with server: fetch and then post
async function syncQuotes() {
	const notification = document.getElementById('notification');
	notification.textContent = 'Starting sync with server...';
	await fetchQuotesFromServer();
	await postQuotesToServer();
	notification.textContent = 'Sync with server complete.';
	setTimeout(() => { notification.textContent = ''; }, 4000);
}
// Simulate posting quotes to a mock server
async function postQuotesToServer() {
	const notification = document.getElementById('notification');
	notification.textContent = 'Uploading quotes to server...';
	try {
		const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(quotes)
		});
		if (!response.ok) throw new Error('Server error: ' + response.status);
		notification.textContent = 'Quotes uploaded to server (simulated).';
		setTimeout(() => { notification.textContent = ''; }, 4000);
	} catch (err) {
		notification.textContent = 'Upload failed: ' + err.message;
		setTimeout(() => { notification.textContent = ''; }, 4000);
	}
}
// Simulate fetching quotes from a mock server and merging with local data
async function fetchQuotesFromServer() {
	const notification = document.getElementById('notification');
	notification.textContent = 'Syncing with server...';
	try {
		// Simulate server fetch (replace with your real endpoint if needed)
		const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
		const serverData = await response.json();
		// Simulate server quotes format: { text, category }
		const serverQuotes = serverData.map(post => ({
			text: post.title,
			category: 'Server'
		}));
		let conflicts = 0, added = 0;
		// Merge: server wins on conflict (replace local quote with same text)
		serverQuotes.forEach(sq => {
			const idx = quotes.findIndex(lq => lq.text === sq.text);
			if (idx !== -1) {
				quotes[idx] = sq;
				conflicts++;
			} else {
				quotes.push(sq);
				added++;
			}
			if (!categories.includes(sq.category)) categories.push(sq.category);
		});
		saveQuotes();
		populateCategories();
		filterQuotes();
		notification.textContent = `Sync complete: ${added} new, ${conflicts} conflicts resolved (server wins).`;
		setTimeout(() => { notification.textContent = ''; }, 4000);
	} catch (err) {
		notification.textContent = 'Server sync failed: ' + err.message;
		setTimeout(() => { notification.textContent = ''; }, 4000);
	}
}

// --- Local Storage Integration ---
function loadQuotes() {
	const stored = localStorage.getItem('quotes');
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return [];
		}
	}
	// Default quotes if nothing in storage
	return [
		{ text: "The only way to do great work is to love what you do.", category: "Motivation" },
		{ text: "Life is what happens when you're busy making other plans.", category: "Life" },
		{ text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
		{ text: "Happiness depends upon ourselves.", category: "Happiness" },
	];
}

function saveQuotes() {
	localStorage.setItem('quotes', JSON.stringify(quotes));
}

let quotes = loadQuotes();
let categories = Array.from(new Set(quotes.map(q => q.category)));

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Create category selector
function createCategorySelector() {
	let selector = document.getElementById('categorySelector');
	if (selector) selector.remove();
	selector = document.createElement('select');
	selector.id = 'categorySelector';
	const allOption = document.createElement('option');
	allOption.value = '';
	allOption.textContent = 'All Categories';
	selector.appendChild(allOption);
	categories.forEach(cat => {
		const option = document.createElement('option');
		option.value = cat;
		option.textContent = cat;
		selector.appendChild(option);
	});
	selector.addEventListener('change', showRandomQuote);
	quoteDisplay.parentNode.insertBefore(selector, quoteDisplay);
}

// Populate the visible category filter (<select id="categoryFilter") in the static HTML
function populateCategories() {
	const filter = document.getElementById('categoryFilter');
	if (!filter) return;
	// Clear existing dynamic options (keep the 'all' option)
	filter.querySelectorAll('option.dynamic').forEach(o => o.remove());
	categories.forEach(cat => {
		const option = document.createElement('option');
		option.value = cat;
		option.textContent = cat;
		option.className = 'dynamic';
		filter.appendChild(option);
	});
	// Restore last selected filter from localStorage
	const saved = localStorage.getItem('selectedCategory');
	if (saved) {
		filter.value = saved;
	}
}

function filterQuotes() {
	const filter = document.getElementById('categoryFilter');
	if (!filter) return;
	const val = filter.value;
	localStorage.setItem('selectedCategory', val);
	// When filtering, display first matching quote or a message
	let filtered = val === 'all' ? quotes : quotes.filter(q => q.category === val);
	if (filtered.length === 0) {
		quoteDisplay.textContent = 'No quotes available for this category.';
		return;
	}
	const q = filtered[0];
	quoteDisplay.innerHTML = `<blockquote>"${q.text}"</blockquote><em>- ${q.category}</em>`;
	// Save last viewed in session to keep session behaviour consistent
	sessionStorage.setItem('lastViewedQuote', JSON.stringify({ text: q.text, category: q.category }));
}

function showRandomQuote() {
	const selector = document.getElementById('categorySelector');
	const selectedCategory = selector ? selector.value : '';
	let filteredQuotes = selectedCategory
		? quotes.filter(q => q.category === selectedCategory)
		: quotes;
	if (filteredQuotes.length === 0) {
		quoteDisplay.textContent = 'No quotes available for this category.';
		return;
	}
	const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
	const quote = filteredQuotes[randomIndex];
	quoteDisplay.innerHTML = `<blockquote>"${quote.text}"</blockquote><em>- ${quote.category}</em>`;
	// Save last viewed quote index in sessionStorage
	sessionStorage.setItem('lastViewedQuote', JSON.stringify({
		text: quote.text,
		category: quote.category
	}));
}

function createAddQuoteForm() {
	let form = document.getElementById('addQuoteForm');
	if (form) form.remove();
	form = document.createElement('div');
	form.id = 'addQuoteForm';
	form.innerHTML = `
		<input id="newQuoteText" type="text" placeholder="Enter a new quote" />
		<input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
		<button id="addQuoteBtn">Add Quote</button>
	`;
	quoteDisplay.parentNode.insertBefore(form, quoteDisplay.nextSibling);
	document.getElementById('addQuoteBtn').onclick = addQuote;
}

function addQuote() {
	const textInput = document.getElementById('newQuoteText');
	const categoryInput = document.getElementById('newQuoteCategory');
	const text = textInput.value.trim();
	const category = categoryInput.value.trim();
	if (!text || !category) {
		alert('Please enter both a quote and a category.');
		return;
	}
	quotes.push({ text, category });
	if (!categories.includes(category)) {
		categories.push(category);
		createCategorySelector();
		populateCategories();
	}
	textInput.value = '';
	categoryInput.value = '';
	saveQuotes();
	showRandomQuote();
}

// --- JSON Import/Export ---
function createImportExportControls() {
	// If static controls exist in HTML (we added them), wire them. Otherwise create dynamic controls.
	const staticExport = document.getElementById('exportQuotesBtn');
	const staticImport = document.getElementById('importFile');
	if (staticExport && staticImport) {
		document.getElementById('exportQuotesBtn').onclick = exportQuotesToJson;
		document.getElementById('importFile').onchange = importFromJsonFile;
		return;
	}
	let controls = document.getElementById('importExportControls');
	if (controls) controls.remove();
	controls = document.createElement('div');
	controls.id = 'importExportControls';
	controls.style.marginTop = '2em';
	controls.innerHTML = `
		<button id="exportQuotesBtn">Export Quotes (JSON)</button>
		<input type="file" id="importFile" accept=".json" style="display:inline-block;margin-left:1em;" />
	`;
	document.body.appendChild(controls);
	document.getElementById('exportQuotesBtn').onclick = exportQuotesToJson;
	document.getElementById('importFile').onchange = importFromJsonFile;
}

function exportQuotesToJson() {
	const dataStr = JSON.stringify(quotes, null, 2);
	const blob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'quotes.json';
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 0);
}

function importFromJsonFile(event) {
	const fileReader = new FileReader();
	fileReader.onload = function(e) {
		try {
			const importedQuotes = JSON.parse(e.target.result);
			if (!Array.isArray(importedQuotes)) throw new Error('Invalid format');
			let added = 0;
			importedQuotes.forEach(q => {
				if (q.text && q.category) {
					quotes.push({ text: q.text, category: q.category });
					if (!categories.includes(q.category)) categories.push(q.category);
					added++;
				}
			});
			saveQuotes();
			createCategorySelector();
			populateCategories();
			alert(`Quotes imported successfully! (${added} added)`);
			showRandomQuote();
		} catch (err) {
			alert('Failed to import quotes: ' + err.message);
		}
	};
	fileReader.readAsText(event.target.files[0]);
}


// Initial setup
createCategorySelector();
createAddQuoteForm();
createImportExportControls();
populateCategories();

// Wire the static category filter to filterQuotes
const staticFilter = document.getElementById('categoryFilter');
if (staticFilter) {
	staticFilter.addEventListener('change', filterQuotes);
	// Apply saved filter immediately
	const savedFilter = localStorage.getItem('selectedCategory');
	if (savedFilter) {
		staticFilter.value = savedFilter;
		filterQuotes();
	}
}

// Restore last viewed quote from sessionStorage if available
const lastViewed = sessionStorage.getItem('lastViewedQuote');
if (lastViewed) {
	try {
		const q = JSON.parse(lastViewed);
		quoteDisplay.innerHTML = `<blockquote>"${q.text}"</blockquote><em>- ${q.category}</em>`;
	} catch {
		showRandomQuote();
	}
} else {
	showRandomQuote();
}
newQuoteBtn.addEventListener('click', showRandomQuote);
