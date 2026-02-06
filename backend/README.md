
<h2 align="center">⚙️ Backend Service – AQI Analytics & Prediction</h2>

<p align="center">
Backend layer for the <b>IoT-Enabled Hyperlocal Weather & AQI Dashboard</b><br/>
Responsible for data ingestion, preprocessing, and machine-learning inference
</p>

<hr/>

<h3>📌 Purpose</h3>

<p>
This backend provides a lightweight API layer that:
</p>

<ul>
  <li>Loads and serves cleaned historical environmental data</li>
  <li>Performs AQI prediction using pre-trained ML models</li>
  <li>Acts as a bridge between raw data storage and frontend visualization</li>
</ul>

<p>
The backend is intentionally kept <b>minimal</b> to avoid unnecessary
infrastructure overhead while still supporting advanced analytics.
</p>

<hr/>

<h3>📂 Folder Structure</h3>

<pre>
backend/
├── app.py                # FastAPI application entry point
├── CLEANED_DATA.csv      # Preprocessed historical sensor data
├── requirements.txt     # Python dependencies
├── model/                # ML models and scalers
│   ├── lstm_aqi_model_clean.keras
│   ├── aqi_scaler.pkl
│   └── README.md
└── README.md             # This file
</pre>

<hr/>

<h3>🧠 Machine Learning</h3>

<ul>
  <li><b>Model:</b> LSTM-based time series predictor</li>
  <li><b>Framework:</b> TensorFlow / Keras</li>
  <li><b>Preprocessing:</b> Feature scaling using saved scaler</li>
  <li><b>Prediction Target:</b> Air Quality Index (AQI)</li>
</ul>

<p>
Models are loaded at runtime and used to generate short-term AQI predictions
based on recent environmental conditions.
</p>

<hr/>

<h3>🚀 API Overview</h3>

<ul>
  <li>
    <b>GET /</b><br/>
    Health check endpoint
  </li>
  <li>
    <b>GET /history</b><br/>
    Returns cleaned historical temperature, humidity, and AQI data
  </li>
  <li>
    <b>POST /predict</b><br/>
    Accepts recent sensor values and returns predicted AQI
  </li>
</ul>

<hr/>

<h3>▶️ Running Locally</h3>

<pre>
# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app:app --reload
</pre>

<p>
The API will be available at:
</p>

<pre>
http://127.0.0.1:8000
</pre>

<hr/>

<h3>⚠️ Notes</h3>

<ul>
  <li>This backend is <b>not required</b> for GitHub Pages deployment</li>
  <li>Used primarily for:
    <ul>
      <li>Local development</li>
      <li>Model validation</li>
      <li>Academic evaluation</li>
    </ul>
  </li>
  <li>Production deployment may use serverless or managed ML inference</li>
</ul>

<hr/>

<p align="center">
<i>Designed for clarity, maintainability, and real-world system demonstration.</i>
</p>
