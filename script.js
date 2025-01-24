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
const voiceIcon = document.getElementById("voiceIcon");

// List of search engines
const engines = [
    { name: "ChatGPT", url: "https://chat.openai.com/search?q=" },
    { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=" },
    { name: "Google", url: "https://www.google.com/search?q=" },
];

// Set the default placeholder
inputBox.placeholder = PLACEHOLDER_DEFAULT;

// Initialize tooltip text
function updateTooltip() {
    tooltip.textContent = engines[slider.value].name;
}
updateTooltip();

// Update tooltip whenever the slider moves
slider.addEventListener("input", () => {
    updateTooltip();
});

// Perform search
function performSearch() {
    const query = inputBox.value.trim();
    if (query) {
        const engineIndex = parseInt(slider.value, 10);
        const searchURL = engines[engineIndex].url + encodeURIComponent(query);
        window.open(searchURL, "_blank");
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

// ===============================
// DARK MODE TOGGLE
// ===============================
darkModeToggle.addEventListener("click", () => {
    // Toggle body .dark
    document.body.classList.toggle("dark");
    const isDarkMode = document.body.classList.contains("dark");

    // Remember preference
    localStorage.setItem("darkMode", isDarkMode);

    // Switch theme icon classes: day ↔ night
    if (isDarkMode) {
        darkModeToggle.classList.remove("day");
        darkModeToggle.classList.add("night");
    } else {
        darkModeToggle.classList.remove("night");
        darkModeToggle.classList.add("day");
    }
});

// Load stored dark mode preference
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    // Switch icon to .night
    darkModeToggle.classList.remove("day");
    darkModeToggle.classList.add("night");
}

// ===============================
// SPEECH-TO-TEXT (Voice Icon)
// ===============================
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
        recognition.stop();
        voiceIcon.classList.remove("active");
        inputBox.placeholder = PLACEHOLDER_DEFAULT;
        isListening = false;
    };

    recognition.onend = () => {
        console.log("Speech recognition ended.");
        voiceIcon.classList.remove("active");
        inputBox.placeholder = PLACEHOLDER_DEFAULT;
        isListening = false;
    };

    // Toggle listening on click
    voiceIcon.addEventListener("click", () => {
        if (!isListening) {
            recognition.start();
            voiceIcon.classList.add("active");
            inputBox.placeholder = PLACEHOLDER_LISTENING;
        } else {
            recognition.stop();
            voiceIcon.classList.remove("active");
            inputBox.placeholder = PLACEHOLDER_DEFAULT;
        }
        isListening = !isListening;
    });
} else {
    // If browser doesn't support speech
    voiceIcon.addEventListener("click", () => {
        alert("Your browser does not support speech recognition.");
    });
}
