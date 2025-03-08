// --------------------------------
// CONFIGURABLE STRINGS
// --------------------------------
const PLACEHOLDER_DEFAULT = "Search here...";
const PLACEHOLDER_LISTENING = "Listening...";
const ERROR_MESSAGE = "Speech recognition error:";

// DOM elements
const slider = document.getElementById("searchSlider");
const tooltip = document.getElementById("tooltip");
const searchBtn = document.getElementById("searchBtn");
const inputBox = document.getElementById("inputbox");
const darkModeToggle = document.getElementById("darkModeToggle");
const micIcon = document.getElementById("micIcon");

// --------------------------------
// Search Engines and Colors
// --------------------------------
const engines = [
  { name: "Google", url: "https://www.google.com/search?q=" },
  { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=" },
  { name: "ChatGPT", url: "https://chat.openai.com/search?q=" }
];

const engineColors = ["#2563eb", "#4caf50", "#e11d48"];

// Set the default placeholder
inputBox.placeholder = PLACEHOLDER_DEFAULT;

/*
  Helper Function: Converts a hex color (e.g., "#4caf50") to an rgba() string
  with the given alpha value.
*/
function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/*
  updateTooltip():
  - Updates the tooltip text.
  - Updates CSS custom properties (--btn-color and --btn-hover-color) on the search button.
*/
function updateTooltip() {
  const idx = parseInt(slider.value, 10);
  tooltip.textContent = engines[idx].name;
  const btnColor = engineColors[idx];
  searchBtn.style.setProperty("--btn-color", btnColor);
  searchBtn.style.setProperty("--btn-hover-color", hexToRgba(btnColor, 0.7));
}
updateTooltip();

slider.addEventListener("input", () => {
  updateTooltip();
});

// --------------------------------
// Utility: Store and Predict Slider Choices
// --------------------------------
const SLIDER_HISTORY_KEY = "sliderHistory";

function updateSliderHistory(choice) {
  const history = JSON.parse(localStorage.getItem(SLIDER_HISTORY_KEY)) || [];
  history.push(choice);
  if (history.length > 2) {
    history.shift();
  }
  localStorage.setItem(SLIDER_HISTORY_KEY, JSON.stringify(history));
}

function predictNextSliderValue() {
  const history = JSON.parse(localStorage.getItem(SLIDER_HISTORY_KEY)) || [];
  if (history.length === 2 && history[0] === history[1]) {
    return history[0];
  }
  return null;
}

const predictedValue = predictNextSliderValue();
if (predictedValue !== null) {
  slider.value = predictedValue;
  updateTooltip();
}

// --------------------------------
// Search History Functionality
// --------------------------------
const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY_ITEMS = 5;

function saveSearchHistory(query) {
  let history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  history = history.filter(item => item !== query);
  history.unshift(query);
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  updateSearchHistoryDisplay();
}

function updateSearchHistoryDisplay() {
  const historyContainer = document.getElementById("search-history");
  let history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];

  if (history.length === 0) {
    historyContainer.innerHTML = "";
    return;
  }

  const ul = document.createElement("ul");
  ul.classList.add("search-history-list"); // Add class for SortableJS

  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.setAttribute("data-index", index);
    li.setAttribute("draggable", true); // Enable drag
    li.classList.add("draggable-item"); // For styling

    const spanText = document.createElement("span");
    spanText.className = "history-text";
    spanText.textContent = item;
    li.appendChild(spanText);

    const removeIcon = document.createElement("span");
    removeIcon.className = "remove-icon";
    removeIcon.title = "Remove";
    removeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>`;
    li.appendChild(removeIcon);

    ul.appendChild(li);
  });

  historyContainer.innerHTML = "";
  historyContainer.appendChild(ul);

  // Enable Drag & Drop with SortableJS
  new Sortable(ul, {
    animation: 150, // Smooth animation
    ghostClass: "dragging",
    onEnd: function () {
      saveNewOrder();
    }
  });

  // Remove item event listener
  ul.addEventListener("click", function (e) {
    const li = e.target.closest("li");
    if (!li) return;
    const index = parseInt(li.getAttribute("data-index"), 10);
    if (e.target.closest(".remove-icon")) {
      let currentHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
      currentHistory.splice(index, 1);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(currentHistory));
      updateSearchHistoryDisplay();
    } else {
      inputBox.value = li.querySelector(".history-text").textContent;
    }
  });
}

updateSearchHistoryDisplay();

function saveNewOrder() {
  const items = document.querySelectorAll(".search-history-list li .history-text");
  let newHistory = [];
  items.forEach(item => {
    newHistory.push(item.textContent);
  });
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

// --------------------------------
// Perform Search
// --------------------------------
function performSearch() {
  const query = inputBox.value.trim();
  if (query) {
    const engineIndex = parseInt(slider.value, 10);
    window.open(`${engines[engineIndex].url}${encodeURIComponent(query)}`, "_blank");
    saveSearchHistory(query);
    updateSliderHistory(engineIndex);
    inputBox.value = "";
  }
}

searchBtn.addEventListener("click", performSearch);
inputBox.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

// --------------------------------
// Dark Mode Toggle Logic with Improved Minimalist Icons
// --------------------------------

// Minimalist Moon Icon (original style)
const moonIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// Minimalist Sun Icon (original style)
const sunIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// New wavy modern minimalist voice icon (to replace the mic icon)
const voiceIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <!-- Five vertical bars: outer bars are shorter, middle bar is taller -->
  <rect x="2" y="10" width="2" height="4" fill="currentColor"/>
  <rect x="7" y="8" width="2" height="8" fill="currentColor"/>
  <rect x="12" y="6" width="2" height="12" fill="currentColor"/>
  <rect x="17" y="8" width="2" height="8" fill="currentColor"/>
  <rect x="22" y="10" width="2" height="4" fill="currentColor"/>
</svg>`;

// Set the new voice icon into the micIcon element
micIcon.innerHTML = voiceIconSVG;

// Ensure the dark mode toggle has a child element for the icon.
if (!darkModeToggle.querySelector(".toggle-icon")) {
  darkModeToggle.innerHTML = '<div class="toggle-icon"></div>';
}

// Function to update the dark mode toggle UI.
function updateDarkModeToggleUI() {
  const isDarkMode = document.body.classList.contains("dark");
  if (isDarkMode) {
    // When dark mode is active, show the sun icon.
    darkModeToggle.querySelector(".toggle-icon").innerHTML = sunIconSVG;
  } else {
    // Otherwise, show the moon icon.
    darkModeToggle.querySelector(".toggle-icon").innerHTML = moonIconSVG;
  }
}

// Initialize dark mode state from localStorage.
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
} else {
  document.body.classList.remove("dark");
}
updateDarkModeToggleUI();

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  updateDarkModeToggleUI();
});

// --------------------------------
// Speech-to-Text (Voice Icon) Logic
// --------------------------------
let recognition;
let isListening = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    inputBox.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error(ERROR_MESSAGE, event.error);
    recognition.stop();
    micIcon.classList.remove("active");
    inputBox.placeholder = PLACEHOLDER_DEFAULT;
    isListening = false;
  };

  recognition.onend = () => {
    console.log("Speech recognition ended automatically.");
    micIcon.classList.remove("active");
    inputBox.placeholder = PLACEHOLDER_DEFAULT;
    isListening = false;
  };

  micIcon.addEventListener("click", () => {
    if (!isListening) {
      recognition.start();
      micIcon.classList.add("active");
      inputBox.placeholder = PLACEHOLDER_LISTENING;
    } else {
      recognition.stop();
      micIcon.classList.remove("active");
      inputBox.placeholder = PLACEHOLDER_DEFAULT;
    }
    isListening = !isListening;
  });
} else {
  micIcon.addEventListener("click", () => {
    alert("Your browser does not support speech recognition.");
  });
}
