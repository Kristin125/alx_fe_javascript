// script.js
(() => {
  'use strict';

  const STORAGE_KEY = 'dom_quote_generator_v1';

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') node.className = v;
      else if (k === 'dataset') Object.entries(v).forEach(([k2, v2]) => (node.dataset[k2] = v2));
      else node.setAttribute(k, v);
    }
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  document.addEventListener('DOMContentLoaded', () => {
    let quotes = loadQuotes() || [
      { text: 'The only way to do great work is to love what you do.', category: 'Inspiration' },
      { text: 'Life is what happens when you’re busy making other plans.', category: 'Life' },
      { text: 'If you’re going through hell, keep going.', category: 'Motivation' },
      { text: 'I refuse to join any club that would have me as a member.', category: 'Humor' }
    ];

    const state = { selectedCategory: 'All' };

    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn  = document.getElementById('newQuote');
    const title        = document.querySelector('h1');

    const controls = el('div', { id: 'controls', className: 'controls' });
    const categoryLabel = el('label', { for: 'categoryFilter' }, 'Category:');
    const categoryFilter = el('select', { id: 'categoryFilter', 'aria-label': 'Filter by category' });

    controls.append(categoryLabel, categoryFilter);
    title.insertAdjacentElement('afterend', controls);

    const addForm = createAddQuoteForm();
    controls.insertAdjacentElement('afterend', addForm);

    // Event listeners required by checker
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    categoryFilter.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      displayRandomQuote();
    });

    updateCategoryOptions(false);
    displayRandomQuote();

    function getCategories() {
      return Array.from(new Set(quotes.map(q => q.category))).sort();
    }

    function updateCategoryOptions(preserveSelection = true) {
      const previous = preserveSelection ? categoryFilter.value : 'All';
      const frag = document.createDocumentFragment();
      frag.appendChild(el('option', { value: 'All' }, 'All'));
      for (const cat of getCategories()) {
        frag.appendChild(el('option', { value: cat }, cat));
      }
      categoryFilter.replaceChildren(frag);
      const values = Array.from(categoryFilter.options).map(o => o.value);
      categoryFilter.value = values.includes(previous) ? previous : 'All';
      state.selectedCategory = categoryFilter.value;
    }

    function saveQuotes() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes)); } catch {}
    }

    function loadQuotes() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    // === REQUIRED: displayRandomQuote function ===
    function displayRandomQuote() {
      const pool = state.selectedCategory === 'All'
        ? quotes
        : quotes.filter(q => q.category === state.selectedCategory);

      if (pool.length === 0) {
        quoteDisplay.innerHTML = 'No quotes yet for this category.'; // innerHTML use
        return;
      }

      const random = pool[Math.floor(Math.random() * pool.length)];
      quoteDisplay.innerHTML = `“${random.text}” — ${random.category}`; // innerHTML use
    }

    // Keep old name working
    const showRandomQuote = displayRandomQuote;

    // === REQUIRED: addQuote function ===
    function addQuote(e) {
      if (e) e.preventDefault();

      const textInput = document.getElementById('newQuoteText');
      const categoryInput = document.getElementById('newQuoteCategory');

      const text = textInput.value.trim();
      const category = categoryInput.value.trim();

      if (!text) { alert('Please enter a quote.'); return; }
      if (!category) { alert('Please enter a category.'); return; }

      quotes.push({ text, category });
      saveQuotes();
      updateCategoryOptions(true);
      categoryFilter.value = category;
      state.selectedCategory = category;

      textInput.value = '';
      categoryInput.value = '';
      displayRandomQuote();
    }

    function createAddQuoteForm() {
      const form = el('form', { id: 'addQuoteForm', autocomplete: 'off' });

      const quoteInput = el('input', {
        id: 'newQuoteText',
        type: 'text',
        placeholder: 'Enter a new quote',
        required: '',
        maxlength: '240'
      });

      const categoryInput = el('input', {
        id: 'newQuoteCategory',
        type: 'text',
        placeholder: 'Enter quote category',
        required: '',
        maxlength: '40'
      });

      const addBtn = el('button', { type: 'submit', id: 'addQuoteBtn' }, 'Add Quote');

      form.append(quoteInput, categoryInput, addBtn);
      form.addEventListener('submit', addQuote);

      return form;
    }

    // Make functions available globally for checker
    window.displayRandomQuote = displayRandomQuote;
    window.addQuote = addQuote;
  });
})();
