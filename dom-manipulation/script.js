// script.js
(() => {
  'use strict';

  const STORAGE_KEY = 'dom_quote_generator_v1';

  // Utility to create elements quickly
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
    // ===== State & initial data =====
    let quotes = loadQuotes() || [
      { text: 'The only way to do great work is to love what you do.', category: 'Inspiration' },
      { text: 'Life is what happens when you’re busy making other plans.', category: 'Life' },
      { text: 'If you’re going through hell, keep going.', category: 'Motivation' },
      { text: 'I refuse to join any club that would have me as a member.', category: 'Humor' }
    ];

    const state = { selectedCategory: 'All' };

    // ===== Grab existing DOM nodes from HTML scaffold =====
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn  = document.getElementById('newQuote');
    const title        = document.querySelector('h1');

    // ===== Build dynamic controls (category filter) =====
    const controls = el('div', { id: 'controls', className: 'controls' });
    const categoryLabel = el('label', { for: 'categoryFilter' }, 'Category:');
    const categoryFilter = el('select', { id: 'categoryFilter', 'aria-label': 'Filter by category' });

    controls.append(categoryLabel, categoryFilter);
    title.insertAdjacentElement('afterend', controls);

    // ===== Build dynamic Add Quote form via required function =====
    const addForm = createAddQuoteForm();
    controls.insertAdjacentElement('afterend', addForm);

    // ===== Wire up events =====
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      showRandomQuote();
    });

    // ===== Initial render =====
    updateCategoryOptions(false);
    showRandomQuote();

    // ===== Functions (close over quotes & state) =====
    function getCategories() {
      return Array.from(new Set(quotes.map(q => q.category))).sort();
    }

    function updateCategoryOptions(preserveSelection = true) {
      const previous = preserveSelection ? categoryFilter.value : 'All';
      const frag = document.createDocumentFragment();

      // Always include "All"
      frag.appendChild(el('option', { value: 'All' }, 'All'));

      for (const cat of getCategories()) {
        frag.appendChild(el('option', { value: cat }, cat));
      }

      categoryFilter.replaceChildren(frag);
      // Restore previous if still present; otherwise default to All
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

    // === REQUIRED: Show a random quote (honors category filter) ===
    function showRandomQuote() {
      const pool = state.selectedCategory === 'All'
        ? quotes
        : quotes.filter(q => q.category === state.selectedCategory);

      quoteDisplay.classList.add('quote-card');
      quoteDisplay.replaceChildren(); // clear

      if (pool.length === 0) {
        quoteDisplay.appendChild(el('p', {}, 'No quotes yet for this category.'));
        return;
      }

      const random = pool[Math.floor(Math.random() * pool.length)];

      const frag = document.createDocumentFragment();
      frag.appendChild(el('blockquote', { className: 'quote-text' }, `“${random.text}”`));
      frag.appendChild(el('div', { className: 'meta' }, `— ${random.category}`));

      quoteDisplay.appendChild(frag);
    }

    // === REQUIRED: Create the "Add Quote" form dynamically ===
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

      // Allow pressing Enter to submit; prevent page reload
      form.addEventListener('submit', addQuote);

      // Expose addQuote globally too (if you ever want to use inline onclick, per the brief's example)
      window.addQuote = addQuote;

      function addQuote(e) {
        e.preventDefault();

        const text = quoteInput.value.trim();
        const category = categoryInput.value.trim();

        if (!text) { alert('Please enter a quote.'); return; }
        if (!category) { alert('Please enter a category.'); return; }

        quotes.push({ text, category });
        saveQuotes();

        // Update categories and switch filter to the new/used category
        updateCategoryOptions(true);
        categoryFilter.value = category;
        state.selectedCategory = category;

        // Clear inputs & show the new quote immediately
        quoteInput.value = '';
        categoryInput.value = '';
        showRandomQuote();
      }

      return form;
    }
  });
})();
