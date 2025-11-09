// === CONFIG ===
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxijC7q5I7yiqW8DfvUY6RpD9F79uT362I3qrNoh1EYrw3poGMaO6LnE325x0Iv2Gcycw/exec";  // your live JSON API
const REFRESH_INTERVAL = 30000; // 30 seconds

async function fetchData() {
  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    if (!data.length) throw new Error("No data received");

    // Take last 20 entries
    const recent = data.slice(-20);
    const timestamps = recent.map(r => r.timestamp);
    const temps = recent.map(r => parseFloat(r.temperature));
    const hums = recent.map(r => parseFloat(r.humidity));
    const aqis = recent.map(r => parseFloat(r.mq135));

    // Update latest values
    const last = data[data.length - 1];
    document.getElementById("temp").textContent = last.temperature;
    document.getElementById("hum").textContent = last.humidity;
    document.getElementById("aqi").textContent = last.mq135;
    document.getElementById("time").textContent = last.timestamp;

    // Update chart
    updateChart(timestamps, temps, hums, aqis);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

let chart;
function updateChart(labels, temp, hum, aqi) {
  const ctx = document.getElementById("weatherChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temp,
          borderColor: "red",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Humidity (%)",
          data: hum,
          borderColor: "blue",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Air Quality (MQ135)",
          data: aqi,
          borderColor: "green",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { title: { display: true, text: "Sensor Value" } },
      },
    },
  });
}

// First run + auto refresh
fetchData();
setInterval(fetchData, REFRESH_INTERVAL);
