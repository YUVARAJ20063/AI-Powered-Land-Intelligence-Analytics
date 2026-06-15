import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor

data = pd.read_csv("land_data.csv")

X = data[[
    "area_sqft",
    "distance_city_km",
    "distance_highway_km",
    "schools_nearby",
    "hospitals_nearby",
    "road_width_ft",
    "flood_risk"
]]

y = data["price_per_sqft"]

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "land_model.pkl")

print("Model trained successfully")