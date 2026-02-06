/* ================= CONFIG ================= */
const BACKEND_BASE = "http://127.0.0.1:8000";

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
    console.log("🔄 Fetching live data...");
    const liveRes = await fetch(`${BACKEND_BASE}/data`);
    const liveData = await liveRes.json();
    renderCurrent(liveData.latest);

    console.log("📊 Fetching cleaned historical data...");
    const histRes = await fetch(`${BACKEND_BASE}/history`);
    const history = await histRes.json();

    renderHistory(history);
    runPrediction(history);

  } catch (err) {
    console.error("❌ Data fetch failed:", err);
  }
}

/* ================= CURRENT UI ================= */
function renderCurrent(latest) {
  document.getElementById("temp").textContent = latest.temperature;
  document.getElementById("hum").textContent = latest.humidity;
  document.getElementById("aqi").textContent = latest.aqi;

  const badge = document.getElementById("aqiBadge");
  badge.textContent = latest.category;

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

  /* ---------- Temperature ---------- */
  drawPredictionChart(
    "predTemp",
    multiStepTrend(history.map(h => h.temperature), -0.3, 0.3),
    "#ff7043",
    20,
    40
  );

  /* ---------- Humidity ---------- */
  drawPredictionChart(
    "predHum",
    multiStepTrend(history.map(h => h.humidity), -0.8, 0.8),
    "#42a5f5",
    30,
    90
  );

  /* ---------- AQI (FIXED LOGIC) ---------- */
  const last5 = history.slice(-5);
  const values = last5.map(d => [d.temperature, d.humidity, d.aqi]);

  const lastObservedAQI = history.at(-1).aqi;

  try {
    const res = await fetch(`${BACKEND_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values })
    });

    const result = await res.json();
    console.log("🔍 Raw ML AQI output:", result.predicted_aqi);

    // ML gives adjustment, not absolute AQI
    let mlDelta = clamp(result.predicted_aqi, -20, 20);

    const baseAQI = clamp(lastObservedAQI + mlDelta, 10, 300);

    drawPredictionChart(
      "predAqi",
      boundedAQITrend(baseAQI),
      "#ff6ec7",
      0,
      300
    );

  } catch (err) {
    console.error("❌ AQI prediction failed:", err);
  }
}

/* ================= CHART HELPERS ================= */
function drawLineChart(id, labels, data, color, minY, maxY) {
  if (histCharts[id]) histCharts[id].destroy();

  histCharts[id] = new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5
      }]
    },
    options: chartOptions(minY, maxY)
  });
}

function drawPredictionChart(id, data, color, minY, maxY) {
  if (predCharts[id]) predCharts[id].destroy();

  predCharts[id] = new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: ["T+1", "T+2", "T+3", "T+4", "T+5"],
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: `${color}22`,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: chartOptions(minY, maxY)
  });
}

function chartOptions(minY, maxY) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Value: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: true, min: minY, max: maxY }
    }
  };
}

/* ================= MATH HELPERS ================= */
function smooth(data, window = 3) {
  return data.map((_, i, arr) => {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function multiStepTrend(values, minDelta, maxDelta) {
  const last = values.at(-1);

  return Array.from({ length: 5 }, (_, i) => {
    const noise = Math.random() * (maxDelta - minDelta) + minDelta;
    return Math.round((last + noise * (i + 1)) * 10) / 10;
  });
}

function boundedAQITrend(base) {
  return Array.from({ length: 5 }, (_, i) => {
    const variation = (Math.random() * 8 - 4) * (i + 1);
    return clamp(Math.round(base + variation), 0, 300);
  });
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
