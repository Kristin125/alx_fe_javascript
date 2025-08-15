// --- Q1: Initialize and Load from Local Storage ---
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Utility functions
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown dynamically
function populateCategories() {
  const categorySelect = document.getElementById('category');
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categorySelect.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const categoryFilter = document.getElementById('category').value;
  const filtered = categoryFilter
    ? quotes.filter(q => q.category === categoryFilter)
    : quotes;

  if (filtered.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.textContent = `"${filtered[randomIndex].text}" - ${filtered[randomIndex].category}`;
}

// Add new quote
document.getElementById('quoteForm').addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('quote').value.trim();
  const category = document.getElementById('newCategory').value.trim() || document.getElementById('category').value;

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    e.target.reset();
  }
});

// --- Q2: Category Filter ---
document.getElementById('category').addEventListener('change', showRandomQuote);

// --- Q3: Sync with mock server (server wins) ---
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6', { cache: 'no-store' });
    const serverQuotes = await res.json();
    return serverQuotes.map(item => ({
      text: item.title || String(item.id),
      category: 'Server'
    }));
  } catch (err) {
    console.error('Failed to fetch from server', err);
    return [];
  }
}

function showUpdateNotification(message) {
  let n = document.getElementById('notification');
  if (!n) {
    n = document.createElement('div');
    n.id = 'notification';
    document.body.appendChild(n);
  }
  n.innerHTML = message;
  setTimeout(() => { n.innerHTML = ''; }, 3000);
}

async function syncQuotes() {
  try {
    // POST local quotes to mock API
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotes })
    }).then(r => r.json()).catch(() => {});

    // GET quotes from server
    const mapped = await fetchQuotesFromServer();

    // Merge with conflict resolution (server wins)
    let updated = false;
    mapped.forEach(sq => {
      const idx = quotes.findIndex(q => q.text === sq.text);
      if (idx === -1) {
        quotes.push(sq);
        updated = true;
      } else if (quotes[idx].category !== sq.category) {
        quotes[idx] = sq;
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      showUpdateNotification('Quotes updated from server (conflicts resolved)');
      showRandomQuote();
    }
  } catch (err) {
    console.error('Sync failed', err);
  }
}

// --- Q4: Auto-sync every 60 seconds ---
setInterval(syncQuotes, 60000);

// --- Q5: Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  showRandomQuote();
});
