<h1 align="center">🌦️ IoT-Enabled Hyperlocal Weather & Air Quality Monitoring Dashboard</h1>

<p align="center">
<b>End-to-end IoT + Cloud + Web + ML system</b><br/>
Real-time hyperlocal environmental monitoring with analytics & prediction<br/>
Built for <b>real deployment</b>, not just an academic demo
</p>

<p align="center">
🌐 <b>Live Dashboard:</b>
<a href="https://iot-hyperlocal-weather-aqi-dashboar.vercel.app/" target="_blank">
https://iot-hyperlocal-weather-aqi-dashboard.vercel.app
</a>
</p>

<hr/>

<h2>🧠 Project Overview</h2>

<p>
This project implements a <b>complete production-style IoT pipeline</b> — from
sensor-level data acquisition to a publicly accessible analytics dashboard with
predictive insights.
</p>

<p>
Environmental data such as <b>temperature, humidity, and air quality (AQI)</b> is
collected using an ESP32-based embedded system, transmitted over Wi-Fi, stored in
the cloud, processed by a backend ML service, and visualized using a modern web UI.
</p>

<hr/>

<h2>🚀 Key Capabilities</h2>

<ul>
  <li>Real-time hyperlocal environmental monitoring</li>
  <li>Cloud-based data storage and retrieval</li>
  <li>REST API backend with ML inference</li>
  <li>Interactive dashboards with charts & maps</li>
  <li>Future-value prediction for temperature, humidity, and AQI</li>
  <li>Independent deployment of frontend and backend</li>
</ul>

<hr/>

<h2>🔥 Sensor Monitoring</h2>

<ul>
  <li><b>Temperature (°C)</b> — DHT11</li>
  <li><b>Humidity (%)</b> — DHT11</li>
  <li><b>Air Quality Index (AQI)</b> — MQ135
    <ul>
      <li>Calibration applied</li>
      <li>Noise filtering & signal smoothing</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>🗺️ Location Visualization</h2>

<ul>
  <li>Live device location using Leaflet + OpenStreetMap</li>
  <li>Browser-based geolocation fallback</li>
  <li>Latitude & longitude displayed on the dashboard</li>
</ul>

<hr/>

<h2>📊 Data Visualization & Prediction</h2>

<ul>
  <li>Live value cards for quick monitoring</li>
  <li>Historical trend charts (Chart.js)</li>
  <li>Prediction charts for next-step forecasting</li>
  <li>Stable layout with fixed-height graphs</li>
</ul>

<p>
Prediction logic uses a combination of:
</p>

<ul>
  <li>Trend-based forecasting for temperature & humidity</li>
  <li>LSTM-based ML model for AQI prediction</li>
    <i>Note</i>: The AQI LSTM model is trained on locally collected historical sensor data and is intended for short-horizon trend estimation, not regulatory-grade AQI forecasting.
  <li>Bounded projections to maintain realistic values</li>
</ul>

<hr/>

<h2>🌐 System Architecture</h2>

<pre>
ESP32 (DHT11 + MQ135)
        ↓  Wi-Fi
Cloud Data Ingestion
        ↓
Backend API (FastAPI + ML)
        ↓
Render (Backend Deployment)
        ↓
Frontend (HTML/CSS/JS)
        ↓
Vercel (Frontend Deployment)
        ↓
End User (Browser)
</pre>

<hr/>

<h2>🛠️ Technology Stack</h2>

<table>
  <thead>
    <tr>
      <th align="left">Layer</th>
      <th align="left">Technologies</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Embedded</td>
      <td>ESP32 DevKit V1, DHT11, MQ135</td>
    </tr>
    <tr>
      <td>Connectivity</td>
      <td>Wi-Fi</td>
    </tr>
    <tr>
      <td>Backend</td>
      <td>Python, FastAPI, TensorFlow, scikit-learn</td>
    </tr>
    <tr>
      <td>ML Models</td>
      <td>LSTM (AQI), Scaler-based preprocessing</td>
    </tr>
    <tr>
      <td>Frontend</td>
      <td>HTML, CSS, JavaScript</td>
    </tr>
    <tr>
      <td>Visualization</td>
      <td>Chart.js, Leaflet.js</td>
    </tr>
    <tr>
      <td>Backend Hosting</td>
      <td>Render</td>
    </tr>
    <tr>
      <td>Frontend Hosting</td>
      <td>Vercel</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>📂 Repository Structure</h2>

<pre>
iot-hyperlocal-weather-aqi-dashboard/
├── backend/        # API + ML inference (Render)
│   ├── model/      # Trained ML models
│   ├── app.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/       # Web dashboard (Vercel)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── README.md
│
├── docs/           # Academic documentation
│   ├── report/
│   ├── research_paper/
│   ├── ESP32_Hyperlocal_Weather_ML.pptx
│   └── abstract/
│
├── hardware/       # ESP32 & sensor code
├── .gitignore
└── README.md       # This file
</pre>

<hr/>

<h2>🧩 Engineering Focus</h2>

<ul>
  <li>Clear separation of device, backend, and UI layers</li>
  <li>Independent deployment pipelines</li>
  <li>Scalable, cloud-ready architecture</li>
  <li>Maintainable and extensible design</li>
  <li>Optimized for real-world deployment scenarios</li>
</ul>

<hr/>

<h2>👨‍💻 Author</h2>

<p>
<b>Ayush Padmawar</b><br/>
Electronics & Telecommunication Engineering<br/>
Focused on building practical systems across <b>IoT</b>, <b>full-stack development</b>, and <b>applied AI</b>
</p>

<p>
🔗 LinkedIn:
<a href="https://www.linkedin.com/in/ayush-padmawar21" target="_blank">
ayush-padmawar21
</a>
</p>

<hr/>

<p align="center">
<i>Designed, implemented, and deployed as a real-world system — not just a prototype.</i>
</p>
