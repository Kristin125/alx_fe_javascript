let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

// Display a random quote
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quoteDisplay").innerHTML = quotes[randomIndex].text;
}

// Add a new quote
function addQuote() {
  const quoteInput = document.getElementById("newQuote").value.trim();
  const categoryInput = document.getElementById("newCategory").value.trim();

  if (quoteInput && categoryInput) {
    quotes.push({ text: quoteInput, category: categoryInput });
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
    document.getElementById("newQuote").value = "";
    document.getElementById("newCategory").value = "";
  }
}

// Populate dropdown with unique categories
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = "";

  // Always include "All"
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categorySelect.value = savedCategory;
  }
}

// Filter quotes based on category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    quoteDisplay.innerHTML = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)].text;
  } else {
    quoteDisplay.innerHTML = "No quotes available for this category.";
  }
}

// Restore quotes from localStorage on load
document.addEventListener("DOMContentLoaded", () => {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("newQuoteBtn").addEventListener("click", displayRandomQuote);
  document.getElementById("showQuoteBtn").addEventListener("click", displayRandomQuote);
});
