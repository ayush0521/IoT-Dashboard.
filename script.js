/* ================= CONFIG ================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbw5ltvwZcsyyfCs6_ag3rOcMfgGo6OfVuGV5BEAsREb7-tHk_NymiqViej_CS9aSDWddQ/exec";

let map, marker;

/* ================= LOCATION ================= */
function updateLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);

    document.getElementById("lat").textContent = lat;
    document.getElementById("lon").textContent = lon;

    if (!map) {
      map = L.map("map").setView([lat, lon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      marker = L.marker([lat, lon]).addTo(map);
    } else {
      marker.setLatLng([lat, lon]);
      map.setView([lat, lon]);
    }
  });
}

updateLocation();
setInterval(updateLocation, 300000);

/* ================= FETCH DATA ================= */
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    const { latest, history } = data;

    document.getElementById("temp").textContent = latest.temperature;
    document.getElementById("hum").textContent = latest.humidity;
    document.getElementById("aqi").textContent = latest.aqi;

    const badge = document.getElementById("aqiBadge");
    badge.textContent = latest.category;
    badge.style.background =
      latest.aqi <= 50 ? "#4caf50" :
      latest.aqi <= 100 ? "#ffc107" :
      "#f44336";

    renderChart("histTemp", history.map(h => h.temperature), "#ff7043");
    renderChart("histHum", history.map(h => h.humidity), "#42a5f5");
    renderChart("histAqi", history.map(h => h.aqi), "#ab47bc");

    renderPrediction("predTemp", history.map(h => h.temperature), "#ff7043");
    renderPrediction("predHum", history.map(h => h.humidity), "#42a5f5");
    renderPrediction("predAqi", history.map(h => h.aqi), "#ab47bc");
  });

/* ================= CHART HELPERS ================= */
function renderChart(id, data, color) {
  new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 3,
        fill: true,
        backgroundColor: ctx => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 140);
          g.addColorStop(0, color + "66");
          g.addColorStop(1, color + "00");
          return g;
        },
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: chartOptions()
  });
}

function renderPrediction(id, data, color) {
  const base = data.slice(-6).map(v => v + (Math.random() - 0.5) * 2);

  new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: base.map((_, i) => i),
      datasets: [{
        data: base,
        borderColor: color,
        borderWidth: 3,
        borderDash: [6, 4],
        fill: false,
        tension: 0.45,
        pointRadius: 0
      }]
    },
    options: chartOptions()
  });
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };
}
