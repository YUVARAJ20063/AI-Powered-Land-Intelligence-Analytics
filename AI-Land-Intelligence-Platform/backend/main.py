from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("land_model.pkl")

class LandInput(BaseModel):
    area_sqft: float
    distance_city_km: float
    distance_highway_km: float
    schools_nearby: int
    hospitals_nearby: int
    road_width_ft: float
    flood_risk: int

@app.get("/")
def home():
    return {"message": "Land Intelligence API is running"}

@app.post("/predict")
def predict(data: LandInput):
    features = [[
        data.area_sqft,
        data.distance_city_km,
        data.distance_highway_km,
        data.schools_nearby,
        data.hospitals_nearby,
        data.road_width_ft,
        data.flood_risk
    ]]

    predicted_price = model.predict(features)[0]

    growth_score = min(100, int(
        100
        - data.distance_city_km * 3
        - data.distance_highway_km * 5
        + data.schools_nearby * 4
        + data.hospitals_nearby * 5
        + data.road_width_ft
    ))

    risk_score = min(100, int(
        data.flood_risk * 40
        + data.distance_city_km * 2
        + data.distance_highway_km * 3
    ))

    if growth_score >= 70 and risk_score <= 35:
        status = "Good Investment"
    elif growth_score >= 50:
        status = "Average Investment"
    else:
        status = "Risky Investment"

    return {
        "estimated_price_per_sqft": round(predicted_price, 2),
        "growth_score": growth_score,
        "risk_score": risk_score,
        "investment_status": status,
        "five_year_prediction": round(predicted_price * 1.35, 2)
    }