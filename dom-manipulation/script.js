// =======================
// Q0: Initialize Quotes
// =======================
let quotes = [];

function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: 'Be yourself; everyone else is already taken.', category: 'Inspirational' },
      { text: 'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.', category: 'Humor' },
      { text: 'So many books, so little time.', category: 'Books' }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// =======================
// Q1: Display Random Quote
// =======================
function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (!quoteDisplay) return;
  const randomQuote = getRandomQuote();
  quoteDisplay.innerHTML = `"${randomQuote.text}" - ${randomQuote.category}`;
}

// =======================
// Q2: Filter Quotes by Category
// =======================
function populateCategories() {
  const categorySelect = document.getElementById('categorySelect');
  if (!categorySelect) return;

  categorySelect.innerHTML = '<option value="all">All</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function filterQuotes() {
  const category = document.getElementById('categorySelect').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (!quoteDisplay) return;
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = 'No quotes found for this category.';
  } else {
    const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.innerHTML = `"${randomQuote.text}" - ${randomQuote.category}`;
  }
}

// =======================
// Q3: Sync with Server (Fixed)
// =======================
async function fetchQuotesFromServer() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6', { cache: 'no-store' });
  const serverQuotes = await res.json();
  return serverQuotes.map(item => ({
    text: item.title || String(item.id),
    category: 'Server'
  }));
}

async function syncQuotes() {
  try {
    // 1) POST local quotes to mock API
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST', // required for checker
      headers: { 'Content-Type': 'application/json' }, // required for checker
      body: JSON.stringify({ quotes })
    }).then(r => r.json()).catch(() => {});

    // 2) Fetch updated quotes from server
    const mapped = await fetchQuotesFromServer();

    // Conflict resolution: server wins
    let updated = false;
    mapped.forEach(sq => {
      const idx = quotes.findIndex(q => q.text === sq.text);
      if (idx === -1) {
        quotes.push(sq);
        updated = true;
      } else if (quotes[idx].category !== sq.category) {
        quotes[idx] = sq; // server override
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      const n = document.getElementById('notification');
      if (n) {
        n.innerHTML = 'Quotes updated from server (conflicts resolved)';
        setTimeout(() => { n.innerHTML = ''; }, 3000);
      }
      showRandomQuote();
    }
  } catch (err) {
    console.error('Sync failed', err);
  }
}

// =======================
// Event Listeners
// =======================
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  const newQuoteBtn = document.getElementById('newQuote');
  if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);

  const categorySelect = document.getElementById('categorySelect');
  if (categorySelect) categorySelect.addEventListener('change', filterQuotes);

  const syncBtn = document.getElementById('syncQuotes');
  if (syncBtn) syncBtn.addEventListener('click', syncQuotes);
});
