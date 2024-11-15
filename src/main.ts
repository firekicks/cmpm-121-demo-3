// Import necessary libraries
import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import "./leafletWorkaround.ts";

import luck from "./luck.ts";

// Constants
const GAME_TITLE = "Geocoin Carrier";
const HQ_LOCATION = leaflet.latLng(36.98949379578401, -122.06277128548504);
const ZOOM_LEVEL = 19;
const TILE_SIZE = 0.0001;
const GRID_SPAN = 8;
const CACHE_PROBABILITY = 0.15;

// Setup document elements
document.title = GAME_TITLE;
const canvasContainer = document.querySelector<HTMLDivElement>("#map")!;
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;

// Create the game map
const gameMap = leaflet.map(canvasContainer, {
  center: HQ_LOCATION,
  zoom: ZOOM_LEVEL,
  zoomControl: true,
});

// Add game header
const headerElement = document.createElement("h1");
headerElement.textContent = GAME_TITLE;
canvasContainer.parentElement?.insertBefore(headerElement, canvasContainer);

// Add map tile layer
leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(gameMap);

// Initialize player location marker
const playerMarker = leaflet.marker(HQ_LOCATION).addTo(gameMap);
playerMarker.bindTooltip("You are here");

let playerScore = 0;
statusPanel.textContent = "0 points accumulated";

// Function to manage cache creation and interactions
function createCache(i: number, j: number) {
  const bounds = leaflet.latLngBounds([
    [HQ_LOCATION.lat + i * TILE_SIZE, HQ_LOCATION.lng + j * TILE_SIZE],
    [
      HQ_LOCATION.lat + (i + 1) * TILE_SIZE,
      HQ_LOCATION.lng + (j + 1) * TILE_SIZE,
    ],
  ]);
  const cacheRectangle = leaflet.rectangle(bounds).addTo(gameMap);

  const cacheValue = Math.floor(luck([i, j, "initialValue"].toString()) * 100);

  cacheRectangle.on(
    "click",
    () => handleCacheInteraction(i, j, cacheValue, cacheRectangle),
  );
}

function handleCacheInteraction(
  i: number,
  j: number,
  cacheValue: number,
  cacheRectangle: leaflet.Rectangle,
) {
  const popupContent = `
    <div>Cache available at "${i},${j}". It contains value <span id="value">${cacheValue}</span>.</div>
    <button id="collectBtn">Collect</button><button id="depositBtn">Deposit</button>`;
  const container = document.createElement("div");
  container.innerHTML = popupContent;

  const collectBtn = container.querySelector<HTMLButtonElement>("#collectBtn")!;
  const depositBtn = container.querySelector<HTMLButtonElement>("#depositBtn")!;
  const valueDisplay = container.querySelector<HTMLSpanElement>("#value")!;

  collectBtn.addEventListener("click", () => {
    if (cacheValue > 0) {
      cacheValue--;
      valueDisplay.textContent = cacheValue.toString();
      playerScore++;
      statusPanel.textContent = `${playerScore} points accumulated`;
    }
  });

  depositBtn.addEventListener("click", () => {
    if (playerScore > 0) {
      cacheValue++;
      valueDisplay.textContent = cacheValue.toString();
      playerScore--;
      statusPanel.textContent = `${playerScore} points accumulated`;
    }
  });

  cacheRectangle.bindPopup(container).openPopup();
}

// Generate caches on the map
Array.from({ length: GRID_SPAN * 2 }, (_, i) => i - GRID_SPAN).forEach((i) =>
  Array.from({ length: GRID_SPAN * 2 }, (_, j) => j - GRID_SPAN).forEach(
    (j) => {
      if (luck([i, j].toString()) < CACHE_PROBABILITY) {
        createCache(i, j);
      }
    },
  )
);
