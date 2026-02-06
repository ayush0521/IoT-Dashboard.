<h2 align="center">🧠 AQI Prediction Models</h2>

<p align="center">
Machine Learning artifacts used for <b>Air Quality Index (AQI)</b> prediction<br/>
Trained on cleaned hyperlocal environmental data
</p>

<hr/>

<h3>📦 Contents</h3>

<ul>
  <li>
    <b>lstm_aqi_model_clean.keras</b><br/>
    Deep learning model trained using <b>LSTM</b> architecture for AQI forecasting
  </li>
  <li>
    <b>aqi_scaler.pkl</b><br/>
    Feature scaler used for input normalization during training and inference
  </li>
</ul>

<hr/>

<h3>🧪 Model Details</h3>

<ul>
  <li><b>Model Type:</b> LSTM (Long Short-Term Memory)</li>
  <li><b>Framework:</b> TensorFlow / Keras</li>
  <li><b>Input Features:</b>
    <ul>
      <li>Temperature (°C)</li>
      <li>Humidity (%)</li>
      <li>Previous AQI values</li>
    </ul>
  </li>
  <li><b>Output:</b> Predicted AQI value</li>
</ul>

<hr/>

<h3>⚙️ Usage</h3>

<p>
These artifacts are loaded by the backend inference service:
</p>

<pre>
backend/app.py
</pre>

<p>
The scaler ensures feature normalization consistency, while the LSTM model
performs time-series AQI prediction.
</p>

<hr/>

<h3>⚠️ Notes</h3>

<ul>
  <li>Models are trained on <b>cleaned and preprocessed</b> historical data</li>
  <li>Prediction outputs are <b>bounded and validated</b> at runtime</li>
  <li>Models are included for demonstration and academic evaluation</li>
</ul>

<hr/>

<p align="center">
<i>These models are part of a research-oriented IoT analytics pipeline.</i>
</p>
