from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os
from keras.models import load_model

# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(title="AQI Prediction API")

# Allow frontend (GitHub Pages / local / Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "lstm_aqi_model.keras")
SCALER_PATH = os.path.join(BASE_DIR, "model", "aqi_scaler.pkl")

# -----------------------------
# Globals (loaded once)
# -----------------------------
model = None
scaler = None

# -----------------------------
# Load ML artifacts safely
# -----------------------------
def load_artifacts():
    global model, scaler
    try:
        print("🔄 Loading ML model...")
        model = load_model(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✅ Model & scaler loaded successfully")
    except Exception as e:
        print("❌ ERROR loading model or scaler:", e)
        model = None
        scaler = None

# Load at startup (safe point)
load_artifacts()

# -----------------------------
# Request schema
# -----------------------------
class AQIInput(BaseModel):
    values: list[list[float]]  # expected shape: (5, 3)

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

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict_aqi(data: AQIInput):
    if model is None or scaler is None:
        return {
            "error": "Model or scaler not loaded",
            "predicted_aqi": None
        }

    try:
        arr = np.array(data.values, dtype=np.float32).reshape(1, 5, 3)
        pred_scaled = model.predict(arr)
        pred = scaler.inverse_transform(pred_scaled)
        return {"predicted_aqi": float(pred[0][0])}

    except Exception as e:
        print("❌ Prediction error:", e)
        return {
            "error": str(e),
            "predicted_aqi": None
        }
