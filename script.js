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
const sliderLabels = document.querySelectorAll(".slider-labels .label");

// List of search engines
const engines = [
    { name: "ChatGPT", url: "https://chat.openai.com/search?q=", icon: "chatgpt-icon.png" },
    { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=", icon: "perplexity-icon.png" },
    { name: "Google", url: "https://www.google.com/search?q=", icon: "google-icon.png" },
];

// Set the default placeholder once at initialization
inputBox.placeholder = PLACEHOLDER_DEFAULT;

// Initialize tooltip text based on slider value
function updateTooltip() {
    tooltip.textContent = engines[slider.value].name;
    updateActiveLabel(slider.value);
}

// Update active label
function updateActiveLabel(value) {
    sliderLabels.forEach(label => {
        if (label.dataset.value === value) {
            label.classList.add("active");
        } else {
            label.classList.remove("active");
        }
    });
}

// Initialize labels with icons and names
function initializeLabels() {
    sliderLabels.forEach(label => {
        const value = label.dataset.value;
        const engine = engines[value];
        if (engine) {
            const img = label.querySelector("img");
            const span = label.querySelector("span");
            img.src = engine.icon;
            img.alt = engine.name;
            span.textContent = engine.name;
        }
    });
}

// Call initialization functions
initializeLabels();
updateTooltip();

// Update tooltip text and active label whenever the slider moves
slider.addEventListener("input", () => {
    updateTooltip();
    showTooltip();
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
        alert(`Speech recognition error: ${event.error}`);
        recognition.stop();
        micIcon.classList.remove("active");
        inputBox.placeholder = PLACEHOLDER_DEFAULT;
        isListening = false;
    };

    recognition.onend = () => {
        console.log("Speech recognition ended.");
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
            isListening = true;
        } else {
            // Stop listening
            recognition.stop();
            micIcon.classList.remove("active");
            inputBox.placeholder = PLACEHOLDER_DEFAULT;
            isListening = false;
        }
    });
} else {
    // Browser does not support speech recognition
    micIcon.addEventListener("click", () => {
        alert("Your browser does not support speech recognition.");
    });
}

// Show tooltip
function showTooltip() {
    tooltip.classList.add("show");
    setTimeout(() => {
        tooltip.classList.remove("show");
    }, 1000);
}

// Allow clicking on labels to select the search engine
sliderLabels.forEach(label => {
    label.addEventListener("click", () => {
        const value = label.dataset.value;
        slider.value = value;
        updateTooltip();
        performSearch();
    });

    // Keyboard accessibility for labels
    label.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            label.click();
        }
    });
});

// Keyboard Accessibility for Slider
slider.addEventListener("keydown", (event) => {
    const key = event.key;
    let newValue = parseInt(slider.value, 10);

    if (key === "ArrowRight" || key === "ArrowUp") {
        if (newValue < engines.length - 1) {
            newValue += 1;
            slider.value = newValue;
            updateTooltip();
        }
        event.preventDefault();
    } else if (key === "ArrowLeft" || key === "ArrowDown") {
        if (newValue > 0) {
            newValue -= 1;
            slider.value = newValue;
            updateTooltip();
        }
        event.preventDefault();
    } else if (key === "Home") {
        slider.value = 0;
        updateTooltip();
        event.preventDefault();
    } else if (key === "End") {
        slider.value = engines.length - 1;
        updateTooltip();
        event.preventDefault();
    }
});
