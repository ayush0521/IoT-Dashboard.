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
  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  marker = L.marker([lat, lon]).addTo(map);
  setTimeout(() => map.invalidateSize(), 300);
}

function updateLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      document.getElementById("lat").textContent = lat.toFixed(4);
      document.getElementById("lon").textContent = lon.toFixed(4);

      if (!map) initMap(lat, lon);
      else {
        marker.setLatLng([lat, lon]);
        map.setView([lat, lon]);
      }
    },
    err => console.error("Geolocation error:", err.message)
  );
}

/* ================= DATA FETCH ================= */
async function fetchAllData() {
  try {
    console.log("🔄 Fetching backend data...");
    const res = await fetch(`${BACKEND_BASE}/data`);

    if (!res.ok) throw new Error("Backend not reachable");

    const payload = await res.json();

    if (!payload.raw || !payload.raw.latest || !payload.raw.history) {
      throw new Error("Invalid backend response structure");
    }

    const { latest, history } = payload.raw;

    renderCurrent(latest);
    renderHistory(history);
    runPrediction(history);

  } catch (err) {
    console.error("❌ Data fetch failed:", err.message);
  }
}

/* ================= CURRENT UI ================= */
function renderCurrent(latest) {
  document.getElementById("temp").textContent = latest.temperature ?? "--";
  document.getElementById("hum").textContent = latest.humidity ?? "--";
  document.getElementById("aqi").textContent = latest.aqi ?? "--";

  const badge = document.getElementById("aqiBadge");
  badge.textContent = latest.category ?? "Unknown";

  badge.style.background =
    latest.aqi <= 50 ? "#4caf50" :
    latest.aqi <= 100 ? "#ffc107" :
    "#f44336";
}

/* ================= HISTORY ================= */
function renderHistory(history) {
  const labels = history.map(h => h.timestamp);

  drawLineChart("histTemp", labels, smooth(history.map(h => h.temperature)), "#ff7043", 20, 40);
  drawLineChart("histHum", labels, smooth(history.map(h => h.humidity)), "#42a5f5", 30, 90);
  drawLineChart("histAqi", labels, smooth(history.map(h => h.aqi)), "#ab47bc", 0, 300);
}

/* ================= PREDICTIONS ================= */
async function runPrediction(history) {
  if (history.length < 5) return;

  drawPredictionChart("predTemp", multiStepTrend(history.map(h => h.temperature), -0.3, 0.3), "#ff7043", 20, 40);
  drawPredictionChart("predHum", multiStepTrend(history.map(h => h.humidity), -0.8, 0.8), "#42a5f5", 30, 90);

  const lastObservedAQI = history.at(-1).aqi;

  try {
    const res = await fetch(`${BACKEND_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        values: history.slice(-5).map(d => [d.temperature, d.humidity, d.aqi])
      })
    });

    const result = await res.json();
    const delta = clamp(result.predicted_aqi, -20, 20);

    drawPredictionChart(
      "predAqi",
      boundedAQITrend(lastObservedAQI + delta),
      "#ff6ec7",
      0,
      300
    );

  } catch (err) {
    console.error("❌ AQI prediction failed:", err.message);
  }
}

/* ================= CHART HELPERS ================= */
function drawLineChart(id, labels, data, color, minY, maxY) {
  if (histCharts[id]) histCharts[id].destroy();

  histCharts[id] = new Chart(document.getElementById(id), {
    type: "line",
    data: { labels, datasets: [{ data, borderColor: color, borderWidth: 3, tension: 0.35 }] },
    options: chartOptions(minY, maxY)
  });
}

function drawPredictionChart(id, data, color, minY, maxY) {
  if (predCharts[id]) predCharts[id].destroy();

  predCharts[id] = new Chart(document.getElementById(id), {
    type: "line",
    data: { labels: ["T+1", "T+2", "T+3", "T+4", "T+5"], datasets: [{ data, borderColor: color, tension: 0.4 }] },
    options: chartOptions(minY, maxY)
  });
}

function chartOptions(minY, maxY) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { min: minY, max: maxY } }
  };
}

/* ================= MATH HELPERS ================= */
function smooth(data, window = 3) {
  return data.map((_, i, arr) => {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function multiStepTrend(values, minDelta, maxDelta) {
  const last = values.at(-1);
  return Array.from({ length: 5 }, (_, i) =>
    Math.round((last + (Math.random() * (maxDelta - minDelta) + minDelta) * (i + 1)) * 10) / 10
  );
}

function boundedAQITrend(base) {
  return Array.from({ length: 5 }, (_, i) =>
    clamp(Math.round(base + (Math.random() * 8 - 4) * (i + 1)), 0, 300)
  );
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
