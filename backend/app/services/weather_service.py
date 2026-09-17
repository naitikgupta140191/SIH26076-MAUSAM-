import httpx
from typing import Dict, Any, List, Optional
import math
import random

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

# WMO Weather Interpretation Codes
WMO_CODES = {
    0: ("Clear sky", "Sun"),
    1: ("Mainly clear", "SunDim"),
    2: ("Partly cloudy", "CloudSun"),
    3: ("Overcast", "Cloud"),
    45: ("Foggy", "CloudFog"),
    48: ("Depositing rime fog", "CloudFog"),
    51: ("Light drizzle", "CloudDrizzle"),
    53: ("Moderate drizzle", "CloudDrizzle"),
    55: ("Dense drizzle", "CloudRain"),
    61: ("Slight rain", "CloudRain"),
    63: ("Moderate rain", "CloudRain"),
    65: ("Heavy rain", "CloudRainHeavy"),
    71: ("Slight snow", "Snowflake"),
    73: ("Moderate snow", "Snowflake"),
    75: ("Heavy snow", "Snowflake"),
    80: ("Rain showers", "CloudRain"),
    81: ("Moderate rain showers", "CloudRain"),
    82: ("Violent rain showers", "CloudLightning"),
    95: ("Thunderstorm", "CloudLightning"),
    96: ("Thunderstorm with hail", "CloudLightning"),
}

async def search_pincode(query: str) -> List[Dict[str, Any]]:
    clean_code = query.strip()
    # Try Zippopotam API for India / US postal codes
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            country_code = "in" if clean_code.isdigit() and len(clean_code) == 6 else ("us" if clean_code.isdigit() and len(clean_code) == 5 else "in")
            resp = await client.get(f"https://api.zippopotam.us/{country_code}/{clean_code}")
            if resp.status_code == 200:
                data = resp.json()
                places = data.get("places", [])
                results = []
                for p in places:
                    place_name = p.get("place name", "")
                    state = p.get("state", "")
                    lat = float(p.get("latitude", 0))
                    lon = float(p.get("longitude", 0))
                    if lat != 0 and lon != 0:
                        results.append({
                            "name": f"{place_name}, {state} (PIN: {clean_code})",
                            "country": data.get("country", "India"),
                            "admin1": state,
                            "latitude": lat,
                            "longitude": lon,
                            "timezone": "Asia/Kolkata" if country_code == "in" else "UTC"
                        })
                if results:
                    return results
    except Exception as e:
        print(f"Pincode geocoding error: {e}")

    # Fallback to India Postal API
    try:
        if clean_code.isdigit() and len(clean_code) == 6:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"https://api.postalpincode.in/pincode/{clean_code}")
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and len(data) > 0 and data[0].get("Status") == "Success":
                        post_offices = data[0].get("PostOffice", [])
                        if post_offices:
                            po = post_offices[0]
                            po_name = po.get('Name', '')
                            district = po.get('District', '')
                            state = po.get('State', '')
                            # Geocode post office location via Open-Meteo
                            g_res = await client.get(
                                OPEN_METEO_GEOCODING_URL,
                                params={"name": f"{po_name} {state}", "count": 1, "language": "en", "format": "json"}
                            )
                            if g_res.status_code == 200:
                                g_data = g_res.json()
                                if g_data.get("results"):
                                    m = g_data["results"][0]
                                    return [{
                                        "name": f"{po_name}, {district} (PIN: {clean_code})",
                                        "country": "India",
                                        "admin1": state,
                                        "latitude": m.get("latitude"),
                                        "longitude": m.get("longitude"),
                                        "timezone": "Asia/Kolkata"
                                    }]
    except Exception as e:
        print(f"India Postal API error: {e}")

    return []

async def search_cities(query: str) -> List[Dict[str, Any]]:
    if not query or len(query.strip()) < 2:
        return []

    clean_q = query.strip()

    # If query contains digits (e.g. 110001, 400001, 560001), try pincode lookup first
    if any(char.isdigit() for char in clean_q):
        pin_results = await search_pincode(clean_q)
        if pin_results:
            return pin_results

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                OPEN_METEO_GEOCODING_URL,
                params={"name": clean_q, "count": 8, "language": "en", "format": "json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "name": item.get("name"),
                        "country": item.get("country", ""),
                        "admin1": item.get("admin1", ""),
                        "latitude": item.get("latitude"),
                        "longitude": item.get("longitude"),
                        "timezone": item.get("timezone", "UTC")
                    })
                if results:
                    return results
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    # Pre-built fallback popular cities and pin codes if query matches
    fallback_cities = [
        {"name": "Connaught Place, New Delhi (PIN: 110001)", "country": "India", "admin1": "Delhi", "latitude": 28.6333, "longitude": 77.2167, "timezone": "Asia/Kolkata"},
        {"name": "Fort, Mumbai (PIN: 400001)", "country": "India", "admin1": "Maharashtra", "latitude": 18.9333, "longitude": 72.8333, "timezone": "Asia/Kolkata"},
        {"name": "MG Road, Bengaluru (PIN: 560001)", "country": "India", "admin1": "Karnataka", "latitude": 12.9750, "longitude": 77.6083, "timezone": "Asia/Kolkata"},
        {"name": "New Delhi", "country": "India", "admin1": "Delhi", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata"},
        {"name": "Mumbai", "country": "India", "admin1": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata"},
        {"name": "Bengaluru", "country": "India", "admin1": "Karnataka", "latitude": 12.9716, "longitude": 77.5946, "timezone": "Asia/Kolkata"},
        {"name": "London", "country": "United Kingdom", "admin1": "England", "latitude": 51.5074, "longitude": -0.1278, "timezone": "Europe/London"},
        {"name": "New York", "country": "United States", "admin1": "New York", "latitude": 40.7128, "longitude": -74.0060, "timezone": "America/New_York"},
        {"name": "Tokyo", "country": "Japan", "admin1": "Tokyo", "latitude": 35.6762, "longitude": 139.6503, "timezone": "Asia/Tokyo"},
        {"name": "Sydney", "country": "Australia", "admin1": "New South Wales", "latitude": -33.8688, "longitude": 151.2093, "timezone": "Australia/Sydney"},
    ]
    return [c for c in fallback_cities if clean_q.lower() in c["name"].lower() or clean_q.lower() in c["country"].lower()]

async def fetch_full_environmental_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches raw data from Open-Meteo Weather, Air Quality, Marine, and Soil APIs in parallel.
    """
    weather_params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day",
            "precipitation", "weather_code", "surface_pressure", "wind_speed_10m",
            "wind_direction_10m", "wind_gusts_10m"
        ],
        "hourly": [
            "temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature",
            "precipitation_probability", "precipitation", "weather_code", "surface_pressure",
            "visibility", "wind_speed_10m", "wind_gusts_10m", "uv_index", "soil_temperature_0cm",
            "soil_moisture_0_to_1cm"
        ],
        "daily": [
            "weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset",
            "uv_index_max", "precipitation_sum", "precipitation_probability_max", "wind_speed_10m_max"
        ],
        "timezone": "auto"
    }

    aqi_params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["us_aqi", "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "sulphur_dioxide", "ozone", "dust"],
        "hourly": ["us_aqi", "pm2_5", "pm10", "grass_pollen", "tree_pollen", "weed_pollen"],
        "timezone": "auto"
    }

    marine_params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["wave_height", "wave_direction", "wave_period", "swell_wave_height"],
        "hourly": ["wave_height", "wave_direction", "wave_period"],
        "timezone": "auto"
    }

    weather_data = {}
    aqi_data = {}
    marine_data = {}

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            w_res = await client.get(OPEN_METEO_FORECAST_URL, params=weather_params)
            if w_res.status_code == 200:
                weather_data = w_res.json()
        except Exception as e:
            print(f"Weather API error: {e}")

        try:
            a_res = await client.get(OPEN_METEO_AIR_QUALITY_URL, params=aqi_params)
            if a_res.status_code == 200:
                aqi_data = a_res.json()
        except Exception as e:
            print(f"AQI API error: {e}")

        try:
            m_res = await client.get(OPEN_METEO_MARINE_URL, params=marine_params)
            if m_res.status_code == 200:
                marine_data = m_res.json()
        except Exception as e:
            print(f"Marine API error: {e}")

    return {
        "weather": weather_data,
        "aqi": aqi_data,
        "marine": marine_data
    }
