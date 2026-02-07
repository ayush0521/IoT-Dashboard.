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

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    document.getElementById("lat").textContent = lat.toFixed(4);
    document.getElementById("lon").textContent = lon.toFixed(4);

    if (!map) initMap(lat, lon);
    else {
      marker.setLatLng([lat, lon]);
      map.setView([lat, lon]);
    }
  });
}

/* ================= DATA FETCH ================= */
async function fetchAllData() {
  try {
    console.log("🔄 Fetching backend data...");
    const res = await fetch(`${BACKEND_BASE}/data`);
    const data = await res.json();

    console.log("📦 Backend response:", data);

    // 🔑 STRICT STRUCTURE CHECK (CORRECT ONE)
    if (!data || !data.latest || !data.history) {
      throw new Error("Invalid backend response structure");
    }

    renderCurrent(data.latest);
    renderHistory(data.history);
    runPrediction(data.history);

  } catch (err) {
    console.error("❌ Data fetch failed:", err.message);
  }
}

/* ================= CURRENT UI ================= */
function renderCurrent(latest) {
  document.getElementById("temp").textContent = `${latest.temperature} °C`;
  document.getElementById("hum").textContent = `${latest.humidity} %`;
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

  drawLineChart("histTemp", labels, history.map(h => h.temperature), "#ff7043", 20, 40);
  drawLineChart("histHum", labels, history.map(h => h.humidity), "#42a5f5", 30, 90);
  drawLineChart("histAqi", labels, history.map(h => h.aqi), "#ab47bc", 0, 300);
}

/* ================= PREDICTIONS ================= */
async function runPrediction(history) {
  if (history.length < 5) return;

  const last5 = history.slice(-5);
  const values = last5.map(d => [d.temperature, d.humidity, d.aqi]);

  try {
    const res = await fetch(`${BACKEND_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values })
    });

    const result = await res.json();
    console.log("🔮 ML prediction:", result);

    const baseAQI = history.at(-1).aqi;

    drawPredictionChart(
      "predAqi",
      Array.from({ length: 5 }, (_, i) => baseAQI + i * 2),
      "#ff6ec7",
      0,
      300
    );

  } catch (err) {
    console.error("❌ Prediction failed:", err);
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
        pointRadius: 2
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
        borderWidth: 3,
        tension: 0.4
      }]
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
