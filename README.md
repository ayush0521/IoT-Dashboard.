# 🌦️ IoT Hyperlocal Weather + AQI Dashboard

This project logs real-time temperature, humidity, and air quality data (MQ135) using **ESP32 + DHT22**, 
and visualizes it on a live **Chart.js web dashboard** hosted via **GitHub Pages**.

## 📡 Architecture
- ESP32 → Google Sheets (via Apps Script)
- Apps Script → JSON API (for live data)
- GitHub Pages → Real-time dashboard (HTML + CSS + JS)

## 🔗 Live Dashboard
👉 [https://ayush0521.github.io/IoT-Dashboard/](https://ayush0521.github.io/IoT-Dashboard/)

## 🧠 Tech Stack
| Component | Purpose |
|------------|----------|
| ESP32 DevKit V1 | IoT hardware & sensor data acquisition |
| DHT22 Sensor | Temperature & humidity sensing |
| MQ135 Sensor | Air quality monitoring |
| Google Sheets + Apps Script | Cloud data logging & JSON API |
| HTML, CSS, JS (Chart.js) | Frontend visualization |
| GitHub Pages | Hosting the live dashboard |

## 🖥️ Screenshot
*(You can add one once your dashboard is live.)*

## 👨‍💻 Author
**Ayush Padmawar**
