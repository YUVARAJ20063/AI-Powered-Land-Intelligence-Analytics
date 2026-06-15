import { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    area_sqft: "",
    distance_city_km: "",
    distance_highway_km: "",
    schools_nearby: "",
    hospitals_nearby: "",
    road_width_ft: "",
    flood_risk: "0",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getGrade = (growth, risk) => {
    if (growth >= 80 && risk <= 25) return "A+";
    if (growth >= 70 && risk <= 35) return "A";
    if (growth >= 55 && risk <= 50) return "B";
    return "C";
  };

  const getRiskLevel = (risk) => {
    if (risk <= 25) return "Low Risk";
    if (risk <= 50) return "Medium Risk";
    return "High Risk";
  };

  const predictLand = async () => {
    const payload = {
      area_sqft: Number(form.area_sqft),
      distance_city_km: Number(form.distance_city_km),
      distance_highway_km: Number(form.distance_highway_km),
      schools_nearby: Number(form.schools_nearby),
      hospitals_nearby: Number(form.hospitals_nearby),
      road_width_ft: Number(form.road_width_ft),
      flood_risk: Number(form.flood_risk),
    };

    const response = await axios.post("http://127.0.0.1:8000/predict", payload);
    setResult(response.data);
  };

  const forecastData = result
    ? [
        { year: "Now", value: result.estimated_price_per_sqft },
        { year: "1 Year", value: Math.round(result.estimated_price_per_sqft * 1.08) },
        { year: "3 Years", value: Math.round(result.estimated_price_per_sqft * 1.22) },
        { year: "5 Years", value: result.five_year_prediction },
      ]
    : [];

  const scoreData = result
    ? [
        { name: "Growth", score: result.growth_score },
        { name: "Risk", score: result.risk_score },
      ]
    : [];

  const grade = result ? getGrade(result.growth_score, result.risk_score) : "";
  const riskLevel = result ? getRiskLevel(result.risk_score) : "";
  const roi = result
    ? Math.round(
        ((result.five_year_prediction - result.estimated_price_per_sqft) /
          result.estimated_price_per_sqft) *
          100
      )
    : 0;

  return (
    <div className="app">
      <nav className="navbar">
        <h2>LandIQ Analytics</h2>
        <span>AI + GIS + Investment Intelligence</span>
      </nav>

      <section className="hero">
        <h1>AI-Powered Land Intelligence & Investment Analytics Platform</h1>
        <p>
          Predict land value, analyze growth potential, measure risk, and generate
          data-driven investment insights.
        </p>
      </section>

      <section className="main-grid">
        <div className="form-card">
          <h2>Land Details</h2>

          <input name="area_sqft" placeholder="Area in sqft" onChange={handleChange} />
          <input name="distance_city_km" placeholder="Distance to city in km" onChange={handleChange} />
          <input name="distance_highway_km" placeholder="Distance to highway in km" onChange={handleChange} />
          <input name="schools_nearby" placeholder="Schools nearby" onChange={handleChange} />
          <input name="hospitals_nearby" placeholder="Hospitals nearby" onChange={handleChange} />
          <input name="road_width_ft" placeholder="Road width in feet" onChange={handleChange} />

          <select name="flood_risk" onChange={handleChange}>
            <option value="0">No Flood Risk</option>
            <option value="1">Flood Risk</option>
          </select>

          <button onClick={predictLand}>Analyze Land</button>
        </div>

        {result && (
          <div className="result-card">
            <h2>Investment Summary</h2>

            <div className="grade-box">
              <h1>{grade}</h1>
              <p>Investment Grade</p>
            </div>

            <p><b>Status:</b> {result.investment_status}</p>
            <p><b>Risk Level:</b> {riskLevel}</p>
            <p><b>Expected ROI:</b> {roi}% in 5 years</p>
          </div>
        )}
      </section>

      {result && (
        <>
          <section className="cards">
            <div className="card">
              <h3>Estimated Price</h3>
              <p>₹{result.estimated_price_per_sqft}/sqft</p>
            </div>

            <div className="card">
              <h3>Growth Score</h3>
              <p>{result.growth_score}/100</p>
            </div>

            <div className="card">
              <h3>Risk Score</h3>
              <p>{result.risk_score}/100</p>
            </div>

            <div className="card">
              <h3>5-Year Value</h3>
              <p>₹{result.five_year_prediction}/sqft</p>
            </div>
          </section>

          <section className="analytics">
            <div className="chart-card">
              <h2>Future Price Forecast</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Growth vs Risk Analysis</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="insight-box">
            <h2>AI Business Insights</h2>

            <ul>
              <li>
                This land shows <b>{result.growth_score >= 70 ? "strong" : "moderate"}</b>{" "}
                growth potential based on city distance, road access, schools, and hospitals.
              </li>

              <li>
                Risk level is <b>{riskLevel}</b>, mainly affected by flood risk and distance from key infrastructure.
              </li>

              <li>
                The expected 5-year ROI is <b>{roi}%</b>, making this land a{" "}
                <b>{grade === "A+" || grade === "A" ? "high-value investment option" : "careful analysis required option"}</b>.
              </li>

              <li>
                Wider road access and nearby infrastructure improve resale value and long-term appreciation.
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default App;