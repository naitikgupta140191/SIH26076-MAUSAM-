from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..services.weather_service import search_cities, fetch_full_environmental_data
from ..services.persona_engine import process_persona_insights

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/search")
async def search_location(q: str = Query(..., min_length=2)):
    results = await search_cities(q)
    return {"results": results}

@router.get("/persona-dashboard")
async def get_persona_dashboard(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    persona: str = Query("health"),
    city: str = Query("New Delhi")
):
    valid_personas = ["health", "fitness", "beach", "traveler", "family", "agriculture", "commuter", "event"]
    if persona not in valid_personas:
        persona = "health"

    raw_env = await fetch_full_environmental_data(lat, lon)
    persona_insight = process_persona_insights(persona, raw_env, city)

    # Format current weather overview
    w_curr = raw_env.get("weather", {}).get("current", {})
    w_hourly = raw_env.get("weather", {}).get("hourly", {})
    w_daily = raw_env.get("weather", {}).get("daily", {})

    temp_c = w_curr.get("temperature_2m", 24.0)
    feels_like = w_curr.get("apparent_temperature", temp_c + 1.2)
    humidity = w_curr.get("relative_humidity_2m", 60)
    wind_kph = w_curr.get("wind_speed_10m", 12.0)
    uv_index = w_hourly.get("uv_index", [3.5])[0] if w_hourly.get("uv_index") else 3.5

    # Hourly forecast list for trends chart
    hourly_trend = []
    times = w_hourly.get("time", [])
    temps = w_hourly.get("temperature_2m", [])
    rains = w_hourly.get("precipitation_probability", [])
    h_uv = w_hourly.get("uv_index", [])
    h_aqi = raw_env.get("aqi", {}).get("hourly", {}).get("us_aqi", [])

    for i in range(min(24, len(times))):
        t_str = times[i].split("T")[-1] if "T" in times[i] else times[i]
        hourly_trend.append({
            "time": t_str,
            "temp": temps[i] if i < len(temps) else temp_c,
            "rain_prob": rains[i] if i < len(rains) else 0,
            "uv": h_uv[i] if i < len(h_uv) else 0.0,
            "aqi": h_aqi[i] if i < len(h_aqi) else 45
        })

    # Daily forecast
    daily_trend = []
    d_times = w_daily.get("time", [])
    d_max = w_daily.get("temperature_2m_max", [])
    d_min = w_daily.get("temperature_2m_min", [])
    d_rains = w_daily.get("precipitation_probability_max", [])

    for i in range(min(7, len(d_times))):
        daily_trend.append({
            "date": d_times[i],
            "temp_max": d_max[i] if i < len(d_max) else temp_c + 4,
            "temp_min": d_min[i] if i < len(d_min) else temp_c - 4,
            "rain_prob": d_rains[i] if i < len(d_rains) else 10
        })

    return {
        "location": {
            "city": city,
            "latitude": lat,
            "longitude": lon
        },
        "current_weather": {
            "temp_c": temp_c,
            "feels_like_c": feels_like,
            "humidity": humidity,
            "wind_kph": wind_kph,
            "uv_index": uv_index
        },
        "active_persona": persona,
        "persona_insight": persona_insight,
        "hourly_forecast": hourly_trend,
        "daily_forecast": daily_trend
    }
