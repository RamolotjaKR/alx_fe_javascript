// Dynamic Quote Generator
const quotes = [
	{ text: "The only way to do great work is to love what you do.", category: "Motivation" },
	{ text: "Life is what happens when you're busy making other plans.", category: "Life" },
	{ text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
	{ text: "Happiness depends upon ourselves.", category: "Happiness" },
];

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
	}
	textInput.value = '';
	categoryInput.value = '';
	showRandomQuote();
}

// Initial setup
createCategorySelector();
createAddQuoteForm();
showRandomQuote();
newQuoteBtn.addEventListener('click', showRandomQuote);
