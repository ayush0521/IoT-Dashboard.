from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os
import tensorflow as tf
import requests
import pandas as pd

# ================= HISTORICAL DATA =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "CLEANED_DATA.csv")

df_history = pd.read_csv(CSV_PATH)
print("📊 Historical rows loaded:", len(df_history))
print(df_history.head(2))


# Parse timestamp properly
df_history["Timestamp"] = pd.to_datetime(df_history["Timestamp"])


# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(title="AQI Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "lstm_aqi_model_clean.keras")
SCALER_PATH = os.path.join(BASE_DIR, "model", "aqi_scaler.pkl")
SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbxpRz4eC9di4uCqZ1HeRjt_8WdXHHGYEkrDgO2mfKB_suW8F1X_Pvr6bRdtSDf1K6w-ZA/exec"

# -----------------------------
# Globals
# -----------------------------
model = None
scaler = None

# -----------------------------
# Load ML artifacts
# -----------------------------
def load_artifacts():
    global model, scaler
    try:
        print("🔄 Loading ML model...")
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        scaler = joblib.load(SCALER_PATH)
        print("✅ Model & scaler loaded successfully")
    except Exception as e:
        print("❌ ERROR loading artifacts:", e)
        model = None
        scaler = None

load_artifacts()

# -----------------------------
# Request schema
# -----------------------------
class AQIInput(BaseModel):
    values: list[list[float]]  # shape: (5, 3)

# -----------------------------
# Health check
# -----------------------------
@app.get("/")
def health():
    return {
        "status": "Backend running",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }
def safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


@app.get("/data")
def get_data():
    try:
        response = requests.get(SHEETS_API_URL, timeout=10)
        response.raise_for_status()

        raw = response.json()

        if not isinstance(raw, dict):
            raise ValueError("Google Sheets response is not a dict")

        if "latest" not in raw or not isinstance(raw["latest"], dict):
            raise ValueError("Missing or invalid 'latest' data")

        latest = raw["latest"]

        return {
            "temperature": safe_float(latest.get("temperature")),
            "humidity": safe_float(latest.get("humidity")),
            "aqi": safe_float(latest.get("aqi")),
            "category": str(latest.get("category", "Unknown")),
            "history": raw.get("history", [])
        }

    except Exception as e:
        print("❌ /data ERROR:", e)
        return {
            "temperature": 0,
            "humidity": 0,
            "aqi": 0,
            "category": "Unavailable",
            "history": [],
            "error": str(e)
        }



@app.get("/history")
def get_history():
    try:
        history = []

        # 🔑 Normalize column names once
        df = df_history.copy()
        df.columns = [c.strip() for c in df.columns]

        for _, row in df.iterrows():
            history.append({
                "timestamp": row["Timestamp"].strftime("%Y-%m-%d %H:%M"),
                "temperature": float(row["Avg Temperature"]),
                "humidity": float(row["Avg Humidity"]),
                "aqi": float(row["Avg AQI"]),
                "category": str(row["AQI_Category"])
            })

        return history

    except Exception as e:
        print("❌ HISTORY ERROR:", e)
        return {
            "error": "History parsing failed",
            "details": str(e)
        }

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict_aqi(data: AQIInput):
    if model is None or scaler is None:
        return {"error": "Model or scaler not loaded"}

    try:
        # Convert input
        arr = np.array(data.values, dtype=np.float32)

        if arr.shape != (5, 3):
            return {"error": "Input must be shape (5, 3)"}

        # Scale INPUT
        flat = arr.reshape(-1, 3)
        scaled = scaler.transform(flat)
        scaled = scaled.reshape(1, 5, 3)

        # Predict
        pred = model.predict(scaled)

        return {"predicted_aqi": float(pred[0][0])}

    except Exception as e:
        print("❌ Prediction error:", e)
        return {"error": str(e)}
        
@app.get("/debug/routes")
def list_routes():
    return [route.path for route in app.routes]








