<h2 align="center">🖥️ Frontend – Hyperlocal Weather & AQI Dashboard</h2>

<p align="center">
Client-side web dashboard for real-time visualization and prediction of<br/>
<b>hyperlocal weather and air quality data</b>
</p>

<hr/>

<h3>📌 Purpose</h3>

<p>
This frontend implements the <b>interactive visualization layer</b> of the system.
It consumes sensor data from cloud APIs and presents it in a clean, responsive,
and user-friendly dashboard.
</p>

<p>
The frontend is designed as a <b>pure static application</b>, making it suitable
for deployment on <b>GitHub Pages</b> with zero server-side dependencies.
</p>

<hr/>

<h3>📂 Folder Structure</h3>

<pre>
frontend/
├── index.html    # Main dashboard UI
├── style.css     # Global styling and layout
├── script.js     # Data fetching, charts, maps, predictions
└── README.md     # This file
</pre>

<hr/>

<h3>📊 Dashboard Features</h3>

<ul>
  <li><b>Live readings panel</b> for temperature, humidity, and AQI</li>
  <li><b>Historical trend charts</b> using Chart.js</li>
  <li><b>Prediction charts</b> for next-step forecasting</li>
  <li><b>Interactive map</b> using Leaflet + OpenStreetMap</li>
  <li><b>Automatic geolocation fallback</b> via browser APIs</li>
</ul>

<hr/>

<h3>🧠 Client-Side Prediction</h3>

<p>
Prediction logic is implemented directly in <code>script.js</code> and includes:
</p>

<ul>
  <li>Trend-based multi-step forecasting for temperature and humidity</li>
  <li>Bounded AQI projection for realistic air quality predictions</li>
  <li>Noise-controlled randomness to avoid flat-line predictions</li>
</ul>

<p>
This approach eliminates the need for heavy backend inference during deployment.
</p>

<hr/>

<h3>🗺️ Map & Location Handling</h3>

<ul>
  <li>Primary location source: browser geolocation API</li>
  <li>Fallback support for static coordinates</li>
  <li>Rendered using Leaflet with OpenStreetMap tiles</li>
</ul>

<hr/>

<h3>🌐 Deployment</h3>

<p>
The frontend is deployed as a <b>static site</b> using GitHub Pages.
</p>

<p>
Live URL:
</p>

<pre>
https://ayush0521.github.io/iot-hyperlocal-weather-aqi-dashboard/
</pre>

<p>
No build step or runtime configuration is required.
</p>

<hr/>

<h3>🛠️ Technologies Used</h3>

<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>Vanilla JavaScript</li>
  <li>Chart.js</li>
  <li>Leaflet.js</li>
  <li>OpenStreetMap</li>
</ul>

<hr/>

<h3>⚠️ Notes</h3>

<ul>
  <li>Designed for modern desktop and mobile browsers</li>
  <li>No frameworks used to keep bundle size minimal</li>
  <li>Optimized for academic evaluation and real-world demonstration</li>
</ul>

<hr/>

<p align="center">
<i>Frontend engineered for clarity, performance, and zero-infrastructure deployment.</i>
</p>

