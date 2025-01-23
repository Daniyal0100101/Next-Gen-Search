// --------------------------------
// CONFIGURABLE STRINGS
// --------------------------------
const PLACEHOLDER_DEFAULT = "Type your query here...";
const PLACEHOLDER_LISTENING = "Listening...";
const ERROR_MESSAGE = "Speech recognition error:";

// DOM elements
const slider = document.getElementById("searchSlider");
const tooltip = document.getElementById("tooltip");
const searchBtn = document.getElementById("searchBtn");
const inputBox = document.getElementById("inputbox");
const darkModeToggle = document.getElementById("darkModeToggle");
const micIcon = document.getElementById("micIcon");

// List of search engines
const engines = [
  { name: "ChatGPT", url: "https://chat.openai.com/search?q=" },
  { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=" },
  { name: "Google", url: "https://www.google.com/search?q=" },
];

// Set the default placeholder once at initialization
inputBox.placeholder = PLACEHOLDER_DEFAULT;

// Initialize tooltip text based on slider value
function updateTooltip() {
  tooltip.textContent = engines[slider.value].name;
}
updateTooltip();

// Update tooltip text whenever the slider moves
slider.addEventListener("input", () => {
  updateTooltip();
});

// Perform search based on slider selection
function performSearch() {
  const query = inputBox.value.trim();
  if (query) {
    const engineIndex = parseInt(slider.value, 10);
    window.open(
      `${engines[engineIndex].url}${encodeURIComponent(query)}`,
      "_blank"
    );
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

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDarkMode = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDarkMode);
  darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// Load stored dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  darkModeToggle.textContent = "☀️";
}

// Speech-to-text (mic icon)
let recognition;
let isListening = false;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
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
    // If there's an error (e.g., can't detect speech), stop recognition
    recognition.stop();
    micIcon.classList.remove("active");
    inputBox.placeholder = PLACEHOLDER_DEFAULT;
    isListening = false;
  };

  micIcon.addEventListener("click", () => {
    if (!isListening) {
      // Start listening
      recognition.start();
      micIcon.classList.add("active");
      inputBox.placeholder = PLACEHOLDER_LISTENING;
    } else {
      // Stop listening
      recognition.stop();
      micIcon.classList.remove("active");
      inputBox.placeholder = PLACEHOLDER_DEFAULT;
    }
    isListening = !isListening;
  });
} else {
  // Browser does not support speech recognition
  micIcon.addEventListener("click", () => {
    alert("Your browser does not support speech recognition.");
  });
}
