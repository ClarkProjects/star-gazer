// ==========================================
// 1. CONFIGURATION & CORE VARIABLES
// ==========================================
const apiKey = "h0aTyUsNELxpyTFKFstgnVAw6wxLUb74JYLPUqwR"; 
let map;
let issMarker;
let issInterval;

// Initialize NASA Calendar Date
const dateInput = document.getElementById("space-date");
const today = new Date().toISOString().split("T")[0];
if (dateInput) dateInput.value = today;

// ==========================================
// 2. INTERACTIVE SCREEN SWITCHING LOGIC
// ==========================================
const nasaScreen = document.getElementById("nasa-screen");
const issScreen = document.getElementById("iss-screen");
const toggleNasaBtn = document.getElementById("toggle-nasa");
const toggleIssBtn = document.getElementById("toggle-iss");

toggleNasaBtn.addEventListener("click", () => {
  toggleNasaBtn.classList.add("active");
  toggleIssBtn.classList.remove("active");
  nasaScreen.classList.remove("hidden");
  issScreen.classList.add("hidden");
  clearInterval(issInterval);
});

toggleIssBtn.addEventListener("click", () => {
  toggleIssBtn.classList.add("active");
  toggleNasaBtn.classList.remove("active");
  issScreen.classList.remove("hidden");
  nasaScreen.classList.add("hidden");
  
  initMap();
  trackISS();
  issInterval = setInterval(trackISS, 5000);
});

// ==========================================
// 3. ARCHIVE SCREEN: NASA PICTURE PORTAL
// ==========================================
function fetchSpaceData(chosenDate) {
  const loadingText = document.getElementById("loading-text");
  const mediaContainer = document.getElementById("media-container");
  const titleElement = document.getElementById("photo-title");
  const explanationElement = document.getElementById("photo-explanation");

  loadingText.innerText = "🚨 Calibrating warp drive... Fetching cosmic data... 🚨";
  mediaContainer.innerHTML = "";
  titleElement.innerText = "";
  explanationElement.innerText = "";

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${chosenDate}`;

  fetch(url)
    .then(response => {
      // UPGRADE: If it fails, pass the status code and text along
      if (!response.ok) {
        throw new Error(`NASA Server Error (${response.status}): ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      loadingText.innerText = "";
      titleElement.innerText = data.title;
      explanationElement.innerText = data.explanation;

      if (data.media_type === "image") {
        mediaContainer.innerHTML = `<img src="${data.url}" alt="${data.title}">`;
      } else if (data.media_type === "video") {
        mediaContainer.innerHTML = `<iframe width="100%" height="400" src="${data.url}" frameborder="0" allowfullscreen></iframe>`;
      }
    })
    .catch(error => {
      // This will now print the exact status code on your screen
      loadingText.innerText = `❌ ${error.message}`;
    });
}

// ==========================================
// 4. LIVE TRACKER: INTERNATIONAL SPACE STATION
// ==========================================
function initMap() {
  if (map) return;

  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  const spaceStationIcon = L.divIcon({
    html: '<div style="font-size: 30px; transform: translate(-10px, -15px);">🛰️</div>',
    className: 'iss-custom-icon'
  });

  issMarker = L.marker([0, 0], { icon: spaceStationIcon }).addTo(map);
}

function trackISS() {
  const url = "https://api.wheretheiss.at/v1/satellites/25544";

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const lat = data.latitude.toFixed(4);
      const lng = data.longitude.toFixed(4);
      const velocity = Math.round(data.velocity);

      document.getElementById("iss-lat").innerText = lat;
      document.getElementById("iss-lng").innerText = lng;
      document.getElementById("iss-velocity").innerText = velocity.toLocaleString();

      issMarker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
    })
    .catch(error => console.error("Error connecting to ISS transponder:", error));
}
// ==========================================
// 5. INITIALIZATION & BUTTON WATCHERS
// ==========================================

// Trigger the initial fetch for TODAY's picture automatically on load
fetchSpaceData(today);

// Listen for when someone clicks the "Warp to Date" button
document.getElementById("warp-btn").addEventListener("click", () => {
  if (dateInput.value) {
    fetchSpaceData(dateInput.value);
  }
});
