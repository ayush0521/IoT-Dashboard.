🌦️ IoT-Enabled Hyperlocal Weather & AQI Monitoring Dashboard

A complete IoT data pipeline that captures real-time environmental parameters using an ESP32, logs them to Google Sheets, and visualizes them on a beautifully designed live dashboard using Chart.js, Leaflet Maps, and client-side ML predictions.

🚀 Features
🔥 Real-Time Sensor Monitoring

Temperature (°C) — DHT22

Humidity (%) — DHT22

Air Quality (MQ135 with optimized filtering + calibration)

🗺️ Location Visualization

Live device location on map (Leaflet + OpenStreetMap)

Auto fallback to browser geolocation

Displays latitude & longitude

📊 Interactive Dashboard

Latest readings panel

Mini sparkline trends (Temp, Humidity, AQI)

Full-sized fixed-frame Chart.js graph

Client-side machine-learning predictions (next 6 values for each parameter)

🌐 Cloud-Connected

ESP32 → Google Apps Script → Google Sheets (database)

Sheets → JSON API → Dashboard

Hosted on GitHub Pages

🌍 Live Dashboard

🔗 Visit here:
👉 https://ayush0521.github.io/IoT-Dashboard/

🧩 System Architecture
ESP32 (DHT22 + MQ135)
        ↓  Wi-Fi
Google Apps Script Web App
        ↓  JSON API
Google Sheets (Cloud DB)
        ↓
Static Web Dashboard (GitHub Pages)
        ↓
User (Browser)

🛠️ Tech Stack
Component	Role
ESP32 DevKit V1	Collects sensor readings & uploads data
DHT22	Temperature + humidity sensing
MQ135	Air quality sensing (with calibration + smoothing)
Google Sheets	Cloud database
Google Apps Script	JSON API generation
JavaScript (Chart.js)	Interactive graphs
Leaflet JS	Map visualization
HTML + CSS	Responsive dashboard UI
GitHub Pages	Free hosting & deployment
📱 Dashboard Highlights

Modern responsive UI

Fixed-frame charts (no resizing jumps)

Offline fallback via localStorage

Automatic retries with exponential backoff

Prediction visualization using lightweight linear regression

Clean codebase with optimized CSS/JS


👨‍💻 Author

Ayush Padmawar
