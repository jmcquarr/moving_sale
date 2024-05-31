// Function to update content based on selected language
function updateContent(langData, currentLang) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = langData[key];
    if (key === "reserved") {
      if (currentLang === "jp") {
        element.classList.replace("text-2xl", "text-lg");
      } else if (currentLang === "en") {
        element.classList.replace("text-lg", "text-2xl");
      }
    }
  });
  highlightCurrentLanguage(currentLang);
}

// Function to set the language preference
function setLanguagePreference(lang) {
  localStorage.setItem("language", lang);
  location.reload();
}

// Function to highlight current language
function highlightCurrentLanguage(currentLang) {
  const languages = {
    en: document.getElementById("lang-en"),
    jp: document.getElementById("lang-jp"),
  };

  Object.keys(languages).forEach((lang) => {
    if (lang === currentLang) {
      languages[lang].classList.add("text-white", "font-normal", "cursor-default");
      languages[lang].classList.remove("font-bold", "underline");
    } else {
      languages[lang].classList.add("font-bold", "underline");
      languages[lang].classList.remove("text-white", "font-normal", "cursor-default");
    }
  });
}

// Function to fetch language data
async function fetchLanguageData(lang) {
  const response = await fetch(`languages/${lang}.json`);
  return response.json();
}

// Function to change language
async function changeLanguage(lang) {
  await setLanguagePreference(lang);

  const langData = await fetchLanguageData(lang);
  updateContent(langData, lang);
}

// Function to Change Gallery Image
function changeGalleryImage(clickedThumbnail) {
  const mainImage = document.getElementById("main-img");
  const thumbnails = document.querySelectorAll(".thumbnail");

  mainImage.src = clickedThumbnail.src;
  mainImage.alt = clickedThumbnail.alt;

  thumbnails.forEach((thumb) => {
    thumb.classList.remove("ring-4", "ring-blue-300");
  });
  clickedThumbnail.classList.add("ring-4", "ring-blue-300");
}

// Function to Start Timer
function startTimer(langData) {
  // Set the date we're counting down to
  var countDownDate = new Date("Jun 04, 2024 00:00:00").getTime();

  // Update the count down every 1 second
  var x = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="timer"
    document.getElementById("timer").innerHTML =
      days + langData["d"] + hours + langData["h"] + minutes + langData["m"] + seconds + langData["s"];

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "EXPIRED";
    }
  }, 1000);
}

// Call updateContent() on page load
window.addEventListener("DOMContentLoaded", async () => {
  // Initialize Language Settings
  const userPreferredLanguage = localStorage.getItem("language") || "en";
  const langData = await fetchLanguageData(userPreferredLanguage);
  updateContent(langData, userPreferredLanguage);

  // Initialize Timer
  startTimer(langData);

  // Category Filtering
  const categoryLinks = document.querySelectorAll(".filter-button");
  const cards = document.querySelectorAll(".card");
  const showAllButton = document.getElementById("category_1");
  const categoryHeading = document.getElementById("category-heading");

  categoryLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const category = this.id;
      filterCards(category);
      categoryHeading.setAttribute("data-i18n", category);
      updateContent(langData, userPreferredLanguage);
    });
  });

  showAllButton.addEventListener("click", function () {
    cards.forEach((card) => {
      card.classList.remove("hidden");
    });
    categoryHeading.setAttribute("data-i18n", "null");
    updateContent(langData, userPreferredLanguage);
  });

  function filterCards(category) {
    cards.forEach((card) => {
      if (!card.classList.contains(category)) {
        card.classList.add("hidden");
      } else {
        card.classList.remove("hidden");
      }
    });
  }

  // Sort Items
  const grid = document.querySelector(".item-grid");
  const items = Array.from(grid.children);
  const sortList = document.getElementById("sort-list");
  const sortHeading = document.getElementById("sort_type");
  const reservedItems = items.filter((item) => item.classList.contains("reserved"));
  const soldItems = items.filter((item) => item.classList.contains("sold"));
  const availableItems = items.filter(
    (item) => !item.classList.contains("reserved") && !item.classList.contains("sold")
  );

  sortList.addEventListener("click", (event) => {
    if (event.target.classList.contains("sort-button")) {
      sortItems(event.target.id);
      sortHeading.setAttribute("data-i18n", event.target.id);
      updateContent(langData, userPreferredLanguage);
    }
  });

  function parsePrice(text) {
    const number = parseInt(text.replace(/¥|,/g, ""));
    return isNaN(number) ? 0 : number;
  }

  function sortItems(sortType) {
    let sortedItems = [...availableItems];

    if (sortType === "low_to_high" || sortType === "high_to_low") {
      sortedItems.sort((a, b) => {
        let priceA = parsePrice(a.querySelector(".bg-orange-500").textContent);
        let priceB = parsePrice(b.querySelector(".bg-orange-500").textContent);
        return sortType === "low_to_high" ? priceA - priceB : priceB - priceA;
      });
    }

    grid.innerHTML = "";
    sortedItems.forEach((item) => grid.appendChild(item));
    reservedItems.forEach((item) => grid.appendChild(item));
    soldItems.forEach((item) => grid.appendChild(item));
  }

  sortItems("default");
});
