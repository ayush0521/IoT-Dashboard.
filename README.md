<h2 align="center">🌦️ IoT-Enabled Hyperlocal Weather & Air Quality Monitoring Dashboard</h2>

<p align="center">
End-to-end <b>IoT + Cloud + Web Visualization system</b><br/>
Real-time hyperlocal environmental monitoring with analytics & prediction<br/>
Focused on <b>usability</b>, <b>scalability</b>, and <b>clean system design</b>
</p>

<p align="center">
🔗 <b>Live Dashboard:</b>
<a href="https://ayush0521.github.io/iot-hyperlocal-weather-aqi-dashboard/" target="_blank">
  ayush0521.github.io/iot-hyperlocal-weather-aqi-dashboard
</a>
</p>

<hr/>

<h3>🧠 Project Overview</h3>
<p>
This project implements a <b>complete production-style IoT pipeline</b> — from
sensor-level data acquisition to a publicly accessible analytics dashboard.
</p>
<p>
Environmental data such as <b>temperature, humidity, and air quality</b> is collected
using an ESP32-based embedded system, transmitted over Wi-Fi, stored in the cloud,
and visualized in real time using interactive charts, maps, and browser-side
machine learning predictions.
</p>

<hr/>

<h3>🚀 Key Capabilities</h3>
<ul>
  <li>Real-time environmental data acquisition</li>
  <li>Cloud-based storage using Google Sheets</li>
  <li>REST-style JSON APIs via Google Apps Script</li>
  <li>Static dashboard deployment on GitHub Pages</li>
  <li>Client-side ML predictions (no backend ML server)</li>
</ul>

<hr/>

<h3>🔥 Sensor Monitoring</h3>
<ul>
  <li><b>Temperature (°C)</b> — DHT11</li>
  <li><b>Humidity (%)</b> — DHT11</li>
  <li><b>Air Quality (AQI)</b> — MQ135
    <ul>
      <li>Calibration applied</li>
      <li>Noise filtering & signal smoothing</li>
    </ul>
  </li>
</ul>

<hr/>

<h3>🗺️ Location Visualization</h3>
<ul>
  <li>Live device location using Leaflet + OpenStreetMap</li>
  <li>Automatic fallback to browser-based geolocation</li>
  <li>Latitude & longitude displayed on the dashboard</li>
</ul>

<hr/>

<h3>📊 Data Visualization & Prediction</h3>
<ul>
  <li>Latest readings panel for quick monitoring</li>
  <li>Mini sparkline trends for each parameter</li>
  <li>Fixed-frame Chart.js graphs (no layout jumps)</li>
  <li><b>Client-side prediction engine</b>
    <ul>
      <li>Predicts next 6 values for temperature, humidity, and AQI</li>
      <li>Implemented using lightweight linear regression</li>
    </ul>
  </li>
</ul>

<hr/>

<h3>🌐 System Architecture</h3>

<pre>
ESP32 (DHT11 + MQ135)
        ↓  Wi-Fi
Google Apps Script (Web API)
        ↓
Google Sheets (Cloud Database)
        ↓
Static Web Dashboard (GitHub Pages)
        ↓
End User (Browser)
</pre>

<hr/>

<h3>🛠️ Technology Stack</h3>

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
      <td>Cloud Backend</td>
      <td>Google Apps Script</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Google Sheets</td>
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
      <td>Hosting</td>
      <td>GitHub Pages</td>
    </tr>
  </tbody>
</table>

<hr/>

<h3>🧩 Engineering Focus</h3>
<ul>
  <li>Clear separation of device, cloud, and UI layers</li>
  <li>No unnecessary backend infrastructure</li>
  <li>Maintainable and extensible system design</li>
  <li>Built for real-world deployment scenarios</li>
</ul>

<hr/>

<h3>👨‍💻 Author</h3>
<p>
<b>Ayush Padmawar</b><br/>
Electronics & Telecommunication Engineering<br/>
Building practical systems across <b>IoT</b>, <b>full-stack development</b>, and <b>applied AI</b>
</p>

<p>
🔗 LinkedIn:
<a href="https://www.linkedin.com/in/ayush-padmawar21" target="_blank">
ayush-padmawar21
</a>
</p>

<hr/>

<p align="center">
<i>Built as a real deployment-focused system, not just an academic demo.</i>
</p>
