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
// Updated: Reordered list of search engines 
// and corresponding color codes:
// Index 0: Google       → bluish (#2563eb)
// Index 1: Perplexity AI  → green (#4caf50)
// Index 2: ChatGPT        → red (#e11d48)
// --------------------------------
const engines = [
    { name: "Google", url: "https://www.google.com/search?q=" },
    { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=" },
    { name: "ChatGPT", url: "https://chat.openai.com/search?q=" },
];

const engineColors = ["#2563eb", "#4caf50", "#e11d48"];

// Set the default placeholder once at initialization
inputBox.placeholder = PLACEHOLDER_DEFAULT;

// Initialize tooltip text and update search button color based on slider value
function updateTooltip() {
  const idx = parseInt(slider.value, 10);
  tooltip.textContent = engines[idx].name;
  // Dynamically update the search button's background color using setProperty with "important"
  searchBtn.style.setProperty("background-color", engineColors[idx], "important");
}
updateTooltip();

// --------------------------------
// Utility to store and predict slider choices
// --------------------------------
const SLIDER_HISTORY_KEY = "sliderHistory";

function updateSliderHistory(choice) {
  const history = JSON.parse(localStorage.getItem(SLIDER_HISTORY_KEY)) || [];
  history.push(choice);
  if (history.length > 2) {
    history.shift(); // Keep only the last two choices
  }
  localStorage.setItem(SLIDER_HISTORY_KEY, JSON.stringify(history));
}

function predictNextSliderValue() {
  const history = JSON.parse(localStorage.getItem(SLIDER_HISTORY_KEY)) || [];
  if (history.length === 2 && history[0] === history[1]) {
    return history[0]; // Predict the same value if the last two are identical
  }
  return null; // No prediction if history is incomplete or not consistent
}

const predictedValue = predictNextSliderValue();
if (predictedValue !== null) {
  slider.value = predictedValue;
  updateTooltip();
}

// Update tooltip text and search button color whenever the slider moves
slider.addEventListener("input", () => {
  updateTooltip();
});

// --------------------------------
// Perform search based on slider selection
// --------------------------------
function performSearch() {
  const query = inputBox.value.trim();
  if (query) {
    const engineIndex = parseInt(slider.value, 10);
    window.open(
      `${engines[engineIndex].url}${encodeURIComponent(query)}`,
      "_blank"
    );
    // (Optional) Clear the input box after performing the search:
    // inputBox.value = "";
    updateSliderHistory(engineIndex);
  }
}

// Search button click
searchBtn.addEventListener("click", performSearch);

// Press Enter to search
inputBox.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

// --------------------------------
// Dark Mode Toggle Logic
// --------------------------------
const sunIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
class="icon icon-sun">
  <circle cx="12" cy="12" r="5"></circle>
  <line x1="12" y1="1" x2="12" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="23"></line>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
  <line x1="1" y1="12" x2="3" y2="12"></line>
  <line x1="21" y1="12" x2="23" y2="12"></line>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>`;

const moonIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
class="icon icon-moon">
  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
</svg>`;

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  darkModeToggle.innerHTML = sunIconSVG;
} else {
  darkModeToggle.innerHTML = moonIconSVG;
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDarkMode = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDarkMode);
  darkModeToggle.innerHTML = isDarkMode ? sunIconSVG : moonIconSVG;
});

// --------------------------------
// Speech-to-Text (Mic Icon) Logic
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