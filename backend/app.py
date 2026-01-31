from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import os
from keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model & scaler ONCE
model = load_model(os.path.join(BASE_DIR, "model/lstm_aqi_model.keras"))
scaler = joblib.load(os.path.join(BASE_DIR, "model/aqi_scaler.pkl"))

app = FastAPI(title="AQI Prediction API")

class AQIInput(BaseModel):
    values: list[list[float]]  # shape (5, 3)

@app.get("/")
def health():
    return {"status": "Backend running"}

@app.post("/predict")
def predict_aqi(data: AQIInput):
    arr = np.array(data.values).reshape(1, 5, 3)
    pred_scaled = model.predict(arr)
    pred = scaler.inverse_transform(pred_scaled)
    return {"predicted_aqi": float(pred[0][0])}
