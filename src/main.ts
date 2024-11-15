import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

import "./style.css";
import "./leafletWorkaround.ts";

import { Board } from "./board.ts";

import luck from "./luck.ts";

interface Coin {
  i: number;
  j: number;
  serial: number;
}

const GAME_NAME = "TreasureQuest Odyssey";
document.title = GAME_NAME;

// Create and append the header to the top of the document body
const header = document.createElement("h1");
header.textContent = GAME_NAME;
header.style.textAlign = "center"; // Center the title
document.body.insertBefore(header, document.body.firstChild); // Insert at the top

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;

const HQ_LOCATION = leaflet.latLng(36.98949379578401, -122.06277128548504);
const ZOOM_LEVEL = 19;
const TILE_SIZE = 1e-4;
const GRID_STEPS = 8;
const CACHE_SPAWN_CHANCE = 0.1;

const playerCoins: Coin[] = [];
const coinDisplay = document.createElement("p");
coinDisplay.innerHTML = "Backpack: <div id=coins></div>";
statusPanel.append(coinDisplay);

const neighborhoodBoard = new Board(TILE_SIZE, GRID_STEPS);

const map = leaflet.map(document.getElementById("map")!, {
  center: HQ_LOCATION,
  zoom: ZOOM_LEVEL,
  zoomControl: true,
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: ZOOM_LEVEL,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const playerMarker = leaflet.marker(HQ_LOCATION).bindTooltip("You are here");
playerMarker.addTo(map);

function spawnCache(i: number, j: number, bounds: leaflet.LatLngBounds) {
  const rect = leaflet.rectangle(bounds).addTo(map);

  const coinCount = Math.floor(luck([i, j, "iniValue"].toString()) * 100);
  const cacheCoins: Coin[] = Array.from({ length: coinCount }, (_, serial) => ({
    i,
    j,
    serial,
  }));

  rect.bindPopup(() => {
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `
      <div>Cache at ${i}, ${j}. Tokens available: <span id="value">${cacheCoins.length}</span></div>
      <button id="collect">Collect</button>
      <button id="deposit">Deposit</button>
      <div id="coins"></div>`;

    // Update the display with the initial count of tokens
    updateCoinCounter(cacheCoins, popupDiv);

    popupDiv.querySelector<HTMLButtonElement>("#collect")!.addEventListener(
      "click",
      () => {
        collectCoin(cacheCoins);
        updateCoinCounter(cacheCoins, popupDiv); // Update count after collecting
      },
    );

    popupDiv.querySelector<HTMLButtonElement>("#deposit")!.addEventListener(
      "click",
      () => {
        depositCoin(cacheCoins);
        updateCoinCounter(cacheCoins, popupDiv); // Update count after depositing
      },
    );

    return popupDiv;
  });
}

function collectCoin(cacheCoins: Coin[]) {
  if (cacheCoins.length > 0) {
    const coin = cacheCoins.shift();
    playerCoins.push(coin!);
  }
}

function depositCoin(cacheCoins: Coin[]) {
  if (playerCoins.length > 0) {
    const coin = playerCoins.pop();
    cacheCoins.unshift(coin!);
  }
}

function updateCoinCounter(cacheCoins: Coin[], popupDiv: HTMLDivElement) {
  const availableCoinsDiv = popupDiv.querySelector<HTMLDivElement>("#coins")!;
  availableCoinsDiv.innerHTML = "";
  cacheCoins.slice(0, 5).forEach((coin) => {
    availableCoinsDiv.innerHTML += `${coin.i}:${coin.j}#${coin.serial}</br>`;
  });

  // Update the token count in the popup
  const valueSpan = popupDiv.querySelector<HTMLSpanElement>("#value")!;
  valueSpan.textContent = cacheCoins.length.toString();

  // Update player's inventory display in status panel
  const inventoryCoinsDiv = statusPanel.querySelector<HTMLDivElement>(
    "#coins",
  )!;
  inventoryCoinsDiv.innerHTML = "";
  playerCoins.forEach((coin) => {
    inventoryCoinsDiv.innerHTML += `${coin.i}:${coin.j}#${coin.serial}</br>`;
  });
}

const nearbyCells = neighborhoodBoard.getCellsNearPoint(HQ_LOCATION);
for (const cell of nearbyCells) {
  if (luck([cell.i, cell.j].toString()) < CACHE_SPAWN_CHANCE) {
    spawnCache(cell.i, cell.j, neighborhoodBoard.getCellBounds(cell));
  }
}
