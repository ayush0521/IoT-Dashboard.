/* ================= CONFIG ================= */
const BACKEND_BASE = "https://iot-hyperlocal-weather-aqi-dashboard.onrender.com";

/* ================= GLOBALS ================= */
let map = null;
let marker = null;
let histCharts = {};
let predCharts = {};

/* ================= BOOT ================= */
console.log("✅ script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM loaded");
  updateLocation();
  fetchAllData();
});

/* ================= LOCATION ================= */
function initMap(lat, lon) {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") {
    console.warn("Map container or Leaflet missing");
    return;
  }

  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  marker = L.marker([lat, lon]).addTo(map);
  setTimeout(() => map.invalidateSize(), 300);
}

function updateLocation() {
  if (!navigator.geolocation) {
    initMap(19.1737, 77.3228);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;

      document.getElementById("lat").textContent = latitude.toFixed(4);
      document.getElementById("lon").textContent = longitude.toFixed(4);

      if (!map) initMap(latitude, longitude);
      else {
        marker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude]);
      }
    },
    () => {
      console.warn("Geolocation denied, using fallback");
      initMap(19.1737, 77.3228);
    }
  );
}

/* ================= DATA FETCH ================= */
async function fetchAllData() {
  try {
    console.log("🔄 Fetching backend data...");

    // 1️⃣ Current snapshot
    const currentRes = await fetch(`${BACKEND_BASE}/data`);
    const current = await currentRes.json();

    renderCurrent(current);

    // 2️⃣ Cleaned historical data
    const histRes = await fetch(`${BACKEND_BASE}/history`);
    const history = await histRes.json();

    renderHistory(history);
    runPrediction(history);

    console.log("✅ All data loaded successfully");

  } catch (err) {
    console.error("❌ Data fetch failed:", err.message);
  }
}


/* ================= CURRENT ================= */
function renderCurrent(data) {
  document.getElementById("temp").textContent = `${data.temperature} °C`;
  document.getElementById("hum").textContent = `${data.humidity} %`;
  document.getElementById("aqi").textContent = data.aqi;

  const badge = document.getElementById("aqiBadge");
  badge.textContent = data.category;

  badge.style.background =
    data.aqi <= 50 ? "#4caf50" :
    data.aqi <= 100 ? "#ffc107" :
    "#f44336";
}

/* ================= HISTORY ================= */
function renderHistory(history) {
  const labels = history.map(h => h.timestamp);

  drawLineChart(
    "histTemp",
    labels,
    history.map(h => h.temperature),
    "#ff7043",
    20,
    40
  );

  drawLineChart(
    "histHum",
    labels,
    history.map(h => h.humidity),
    "#42a5f5",
    30,
    90
  );

  drawLineChart(
    "histAqi",
    labels,
    history.map(h => h.aqi),
    "#ab47bc",
    0,
    300
  );
}


/* ================= PREDICTIONS ================= */
function runPrediction(history) {
  if (history.length < 5) return;

  drawPredictionChart("predTemp",
    multiStepTrend(history.map(h => h.temperature), -0.3, 0.3),
    "#ff7043", 20, 40
  );

  drawPredictionChart("predHum",
    multiStepTrend(history.map(h => h.humidity), -0.8, 0.8),
    "#42a5f5", 30, 90
  );

  drawPredictionChart("predAqi",
    boundedAQITrend(history.at(-1).aqi),
    "#ff6ec7", 0, 300
  );
}

/* ================= CHART HELPERS ================= */
function drawLineChart(id, labels, data, color, minY, maxY) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  if (histCharts[id]) histCharts[id].destroy();

  histCharts[id] = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{ data, borderColor: color, tension: 0.35 }]
    },
    options: chartOptions(minY, maxY)
  });
}

function drawPredictionChart(id, data, color, minY, maxY) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  if (predCharts[id]) predCharts[id].destroy();

  predCharts[id] = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["T+1","T+2","T+3","T+4","T+5"],
      datasets: [{ data, borderColor: color, tension: 0.4 }]
    },
    options: chartOptions(minY, maxY)
  });
}

function chartOptions(minY, maxY) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { min: minY, max: maxY }
    }
  };
}

/* ================= HELPERS ================= */
function smooth(data, w = 3) {
  return data.map((_, i, arr) =>
    arr.slice(Math.max(0, i - w + 1), i + 1)
       .reduce((a, b) => a + b, 0) / Math.min(w, i + 1)
  );
}

function multiStepTrend(values, min, max) {
  const last = values.at(-1);
  return Array.from({ length: 5 }, (_, i) =>
    +(last + (Math.random() * (max - min) + min) * (i + 1)).toFixed(1)
  );
}

function boundedAQITrend(base) {
  return Array.from({ length: 5 }, (_, i) =>
    Math.min(300, Math.max(0, Math.round(base + (Math.random() * 8 - 4) * (i + 1))))
  );
}



