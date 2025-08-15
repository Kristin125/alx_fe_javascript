let quotes = [];
let lastViewedQuote = null;

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Get busy living or get busy dying.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const category = document.getElementById('categoryFilter').value;
  let filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  lastViewedQuote = quote;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));

  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - ${quote.category}`;
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    textInput.value = '';
    categoryInput.value = '';
    showRandomQuote();
  }
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const dropdown = document.getElementById('categoryFilter');
  dropdown.innerHTML = '<option value="all">All Categories</option>';

  categorySet.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    dropdown.value = savedCategory;
  }
}

// Filter quotes
function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);
  showRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate server fetch
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    const serverQuotes = await response.json();

    const mapped = serverQuotes.map(item => ({
      text: item.title,
      category: "Server"
    }));

    let hasConflict = false;
    mapped.forEach(sq => {
      if (!quotes.find(q => q.text === sq.text)) {
        quotes.push(sq);
        hasConflict = true;
      }
    });

    if (hasConflict) {
      saveQuotes();
      populateCategories();
      document.getElementById('notification').textContent = "Quotes updated from server (conflicts resolved)";
      setTimeout(() => { document.getElementById('notification').textContent = ""; }, 3000);
    }
  } catch (error) {
    console.error("Server fetch failed", error);
  }
}

// Periodic server sync
setInterval(fetchQuotesFromServer, 30000);

// Event listener
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Init
loadQuotes();
populateCategories();

// Restore last viewed quote from sessionStorage
const storedLastQuote = sessionStorage.getItem('lastViewedQuote');
if (storedLastQuote) {
  const quote = JSON.parse(storedLastQuote);
  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - ${quote.category}`;
} else {
  showRandomQuote();
}
