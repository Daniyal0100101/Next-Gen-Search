// --------------------------------
// CONFIGURATION
// --------------------------------
const config = {
  PLACEHOLDER_DEFAULT: "Search here...",
  PLACEHOLDER_LISTENING: "Listening...",
  ERROR_MESSAGE: "Speech recognition error:",
  SLIDER_HISTORY_KEY: "sliderHistory",
  SEARCH_HISTORY_KEY: "searchHistory",
  MAX_HISTORY_ITEMS: 4,
  engines: [
    { name: "Google", url: "https://www.google.com/search?q=" },
    { name: "Perplexity AI", url: "https://www.perplexity.ai/search?q=" },
    { name: "ChatGPT", url: "https://chat.openai.com/?q=Search%3A%20" }
  ],
  engineColors: ["#2563eb", "#4caf50", "#e11d48"],
  moonIconSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  sunIconSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  voiceIconSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <rect x="2" y="10" width="2" height="4" fill="currentColor"/>
    <rect x="7" y="8" width="2" height="8" fill="currentColor"/>
    <rect x="12" y="6" width="2" height="12" fill="currentColor"/>
    <rect x="17" y="8" width="2" height="8" fill="currentColor"/>
    <rect x="22" y="10" width="2" height="4" fill="currentColor"/>
  </svg>`
};

// --------------------------------
// DOM ELEMENTS
// --------------------------------
const dom = {
  slider: document.getElementById("searchSlider"),
  tooltip: document.getElementById("tooltip"),
  searchBtn: document.getElementById("searchBtn"),
  inputBox: document.getElementById("inputbox"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  micIcon: document.getElementById("micIcon"),
  searchHistoryContainer: document.getElementById("search-history")
};

// --------------------------------
// UTILITY FUNCTIONS
// --------------------------------
const utils = {
  hexToRgba: (hex, alpha) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  getSearchUrl: (engineIndex, query) => {
    return `${config.engines[engineIndex].url}${encodeURIComponent(query)}`;
  },
  loadLocalStorage: (key) => {
    try {
      const serializedValue = localStorage.getItem(key);
      return serializedValue === null ? null : JSON.parse(serializedValue);
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return null;
    }
  },
  saveLocalStorage: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }
};

// --------------------------------
// SLIDER FUNCTIONALITY
// --------------------------------
const slider = {
  updateTooltip: () => {
    const idx = parseInt(dom.slider.value, 10);
    dom.tooltip.textContent = config.engines[idx].name;
    const btnColor = config.engineColors[idx];
    dom.searchBtn.style.setProperty("--btn-color", btnColor);
    dom.searchBtn.style.setProperty("--btn-hover-color", utils.hexToRgba(btnColor, 0.7));
  },
  updateSliderHistory: (choice) => {
    let history = utils.loadLocalStorage(config.SLIDER_HISTORY_KEY) || [];
    history.push(choice);
    if (history.length > 2) {
      history.shift();
    }
    utils.saveLocalStorage(config.SLIDER_HISTORY_KEY, history);
  },
  predictNextValue: () => {
    const history = utils.loadLocalStorage(config.SLIDER_HISTORY_KEY) || [];
    if (history.length === 2 && history[0] === history[1]) {
      return history[0];
    }
    return null;
  },
  initialize: () => {
    dom.slider.addEventListener("input", slider.updateTooltip);
    const predictedValue = slider.predictNextValue();
    if (predictedValue !== null) {
      dom.slider.value = predictedValue;
    }
    slider.updateTooltip();
  }
};

// --------------------------------
// SEARCH HISTORY FUNCTIONALITY
// --------------------------------
const searchHistory = {
  save: (query) => {
    let history = utils.loadLocalStorage(config.SEARCH_HISTORY_KEY) || [];
    history = history.filter(item => item !== query);
    history.unshift(query);
    if (history.length > config.MAX_HISTORY_ITEMS) {
      history = history.slice(0, config.MAX_HISTORY_ITEMS);
    }
    utils.saveLocalStorage(config.SEARCH_HISTORY_KEY, history);
    searchHistory.updateDisplay();
  },
  updateDisplay: () => {
    let history = utils.loadLocalStorage(config.SEARCH_HISTORY_KEY) || [];
    dom.searchHistoryContainer.innerHTML = "";

    if (history.length === 0) return;

    const ul = document.createElement("ul");
    ul.classList.add("search-history-list");

    history.forEach((item, index) => {
      const li = document.createElement("li");
      li.setAttribute("data-index", index);
      li.setAttribute("draggable", true);
      li.classList.add("draggable-item");

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

    dom.searchHistoryContainer.appendChild(ul);

    new Sortable(ul, {
      animation: 150,
      ghostClass: "dragging",
      onEnd: searchHistory.saveNewOrder
    });

    ul.addEventListener("click", searchHistory.handleItemClick);
  },
  handleItemClick: (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const index = parseInt(li.getAttribute("data-index"), 10);
    if (e.target.closest(".remove-icon")) {
      searchHistory.removeItem(index);
    } else {
      dom.inputBox.value = li.querySelector(".history-text").textContent;
    }
  },
  removeItem: (index) => {
    let currentHistory = utils.loadLocalStorage(config.SEARCH_HISTORY_KEY) || [];
    currentHistory.splice(index, 1);
    utils.saveLocalStorage(config.SEARCH_HISTORY_KEY, currentHistory);
    searchHistory.updateDisplay();
  },
  saveNewOrder: () => {
    const items = document.querySelectorAll(".search-history-list li .history-text");
    let newHistory = [];
    items.forEach(item => {
      newHistory.push(item.textContent);
    });
    utils.saveLocalStorage(config.SEARCH_HISTORY_KEY, newHistory);
  },
  initialize: () => {
    searchHistory.updateDisplay();
  }
};

// --------------------------------
// PERFORM SEARCH
// --------------------------------
const performSearch = () => {
  const query = dom.inputBox.value.trim();
  if (query) {
    const engineIndex = parseInt(dom.slider.value, 10);
    window.open(utils.getSearchUrl(engineIndex, query), "_blank");
    searchHistory.save(query);
    slider.updateSliderHistory(engineIndex);
    dom.inputBox.value = "";
  }
};

// --------------------------------
// DARK MODE TOGGLE LOGIC
// --------------------------------
const darkMode = {
  updateUI: () => {
    const isDarkMode = document.body.classList.contains("dark");
    const toggleIcon = dom.darkModeToggle.querySelector(".toggle-icon");
    toggleIcon.innerHTML = isDarkMode ? config.sunIconSVG : config.moonIconSVG;
  },
  toggle: () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    utils.saveLocalStorage("darkMode", isDark);
    darkMode.updateUI();
  },
  initialize: () => {
    if (!dom.darkModeToggle.querySelector(".toggle-icon")) {
      dom.darkModeToggle.innerHTML = '<div class="toggle-icon"></div>';
    }

    if (utils.loadLocalStorage("darkMode") === true) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    darkMode.updateUI();
    dom.darkModeToggle.addEventListener("click", darkMode.toggle);
  }
};

// --------------------------------
// SPEECH-TO-TEXT (VOICE ICON) LOGIC
// --------------------------------
const speechToText = {
  recognition: null,
  isListening: false,
  initialize: () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechToText.recognition = new SpeechRecognition();
      speechToText.recognition.continuous = true;
      speechToText.recognition.interimResults = true;
      speechToText.recognition.lang = "en-US";

      speechToText.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        dom.inputBox.value = transcript;
      };

      speechToText.recognition.onerror = (event) => {
        console.error(config.ERROR_MESSAGE, event.error);
        speechToText.stop();
      };

      speechToText.recognition.onend = () => {
        console.log("Speech recognition ended automatically.");
        speechToText.stop();
      };

      dom.micIcon.addEventListener("click", speechToText.toggleListening);
    } else {
      dom.micIcon.addEventListener("click", () => {
        alert("Your browser does not support speech recognition.");
      });
    }
    dom.micIcon.innerHTML = config.voiceIconSVG;
  },
  start: () => {
    speechToText.recognition.start();
    dom.micIcon.classList.add("active");
    dom.inputBox.placeholder = config.PLACEHOLDER_LISTENING;
    speechToText.isListening = true;
  },
  stop: () => {
    speechToText.recognition.stop();
    dom.micIcon.classList.remove("active");
    dom.inputBox.placeholder = config.PLACEHOLDER_DEFAULT;
    speechToText.isListening = false;
  },
  toggleListening: () => {
    speechToText.isListening ? speechToText.stop() : speechToText.start();
  }
};

// --------------------------------
// INITIALIZATION
// --------------------------------
(() => {
  dom.inputBox.placeholder = config.PLACEHOLDER_DEFAULT;
  slider.initialize();
  searchHistory.initialize();
  darkMode.initialize();
  speechToText.initialize();

  dom.searchBtn.addEventListener("click", performSearch);
  dom.inputBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });
})();
