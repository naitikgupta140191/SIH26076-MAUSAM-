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

import re

INDIAN_FALLBACK_CITIES: List[Dict[str, Any]] = [
    {"name": "Connaught Place, New Delhi (PIN: 110001)", "country": "India", "admin1": "Delhi", "latitude": 28.6333, "longitude": 77.2167, "timezone": "Asia/Kolkata"},
    {"name": "New Delhi", "country": "India", "admin1": "Delhi", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata"},
    {"name": "Noida, Uttar Pradesh (PIN: 201301)", "country": "India", "admin1": "Uttar Pradesh", "latitude": 28.5540, "longitude": 77.3795, "timezone": "Asia/Kolkata"},
    {"name": "Gurugram, Haryana (PIN: 122001)", "country": "India", "admin1": "Haryana", "latitude": 28.4595, "longitude": 77.0266, "timezone": "Asia/Kolkata"},
    {"name": "Fort, Mumbai (PIN: 400001)", "country": "India", "admin1": "Maharashtra", "latitude": 18.9333, "longitude": 72.8333, "timezone": "Asia/Kolkata"},
    {"name": "Mumbai", "country": "India", "admin1": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata"},
    {"name": "Pune, Maharashtra (PIN: 411001)", "country": "India", "admin1": "Maharashtra", "latitude": 18.5204, "longitude": 73.8567, "timezone": "Asia/Kolkata"},
    {"name": "MG Road, Bengaluru (PIN: 560001)", "country": "India", "admin1": "Karnataka", "latitude": 12.9750, "longitude": 77.6083, "timezone": "Asia/Kolkata"},
    {"name": "Bengaluru", "country": "India", "admin1": "Karnataka", "latitude": 12.9716, "longitude": 77.5946, "timezone": "Asia/Kolkata"},
    {"name": "Kolkata, West Bengal (PIN: 700001)", "country": "India", "admin1": "West Bengal", "latitude": 22.5726, "longitude": 88.3639, "timezone": "Asia/Kolkata"},
    {"name": "Chennai, Tamil Nadu (PIN: 600001)", "country": "India", "admin1": "Tamil Nadu", "latitude": 13.0827, "longitude": 80.2707, "timezone": "Asia/Kolkata"},
    {"name": "Hyderabad, Telangana (PIN: 500001)", "country": "India", "admin1": "Telangana", "latitude": 17.3850, "longitude": 78.4867, "timezone": "Asia/Kolkata"},
    {"name": "Jaipur, Rajasthan (PIN: 302001)", "country": "India", "admin1": "Rajasthan", "latitude": 26.9124, "longitude": 75.7873, "timezone": "Asia/Kolkata"},
    {"name": "Ahmedabad, Gujarat (PIN: 380001)", "country": "India", "admin1": "Gujarat", "latitude": 23.0225, "longitude": 72.5714, "timezone": "Asia/Kolkata"},
    {"name": "Lucknow, Uttar Pradesh (PIN: 226001)", "country": "India", "admin1": "Uttar Pradesh", "latitude": 26.8467, "longitude": 80.9462, "timezone": "Asia/Kolkata"},
    {"name": "Varanasi, Uttar Pradesh (PIN: 221001)", "country": "India", "admin1": "Uttar Pradesh", "latitude": 25.3176, "longitude": 82.9739, "timezone": "Asia/Kolkata"},
    {"name": "Chandigarh (PIN: 160017)", "country": "India", "admin1": "Chandigarh", "latitude": 30.7333, "longitude": 76.7794, "timezone": "Asia/Kolkata"},
    {"name": "Srinagar, Jammu & Kashmir (PIN: 190001)", "country": "India", "admin1": "Jammu and Kashmir", "latitude": 34.0837, "longitude": 74.7973, "timezone": "Asia/Kolkata"},
    {"name": "Shimla, Himachal Pradesh (PIN: 171001)", "country": "India", "admin1": "Himachal Pradesh", "latitude": 31.1048, "longitude": 77.1734, "timezone": "Asia/Kolkata"},
    {"name": "Manali, Himachal Pradesh (PIN: 175131)", "country": "India", "admin1": "Himachal Pradesh", "latitude": 32.2432, "longitude": 77.1892, "timezone": "Asia/Kolkata"},
    {"name": "Kasol, Himachal Pradesh (PIN: 175105)", "country": "India", "admin1": "Himachal Pradesh", "latitude": 32.0104, "longitude": 77.3166, "timezone": "Asia/Kolkata"},
    {"name": "Rishikesh, Uttarakhand (PIN: 249201)", "country": "India", "admin1": "Uttarakhand", "latitude": 30.0869, "longitude": 78.2676, "timezone": "Asia/Kolkata"},
    {"name": "Dehradun, Uttarakhand (PIN: 248001)", "country": "India", "admin1": "Uttarakhand", "latitude": 30.3165, "longitude": 78.0322, "timezone": "Asia/Kolkata"},
    {"name": "Bhopal, Madhya Pradesh (PIN: 462001)", "country": "India", "admin1": "Madhya Pradesh", "latitude": 23.2599, "longitude": 77.4126, "timezone": "Asia/Kolkata"},
    {"name": "Indore, Madhya Pradesh (PIN: 452001)", "country": "India", "admin1": "Madhya Pradesh", "latitude": 22.7196, "longitude": 75.8577, "timezone": "Asia/Kolkata"},
    {"name": "Patna, Bihar (PIN: 800001)", "country": "India", "admin1": "Bihar", "latitude": 25.5941, "longitude": 85.1376, "timezone": "Asia/Kolkata"},
    {"name": "Kochi, Kerala (PIN: 682001)", "country": "India", "admin1": "Kerala", "latitude": 9.9312, "longitude": 76.2673, "timezone": "Asia/Kolkata"},
    {"name": "Guwahati, Assam (PIN: 781001)", "country": "India", "admin1": "Assam", "latitude": 26.1445, "longitude": 91.7362, "timezone": "Asia/Kolkata"},
    {"name": "Mawlynnong, Meghalaya (PIN: 793110)", "country": "India", "admin1": "Meghalaya", "latitude": 25.2016, "longitude": 91.9163, "timezone": "Asia/Kolkata"},
    {"name": "Ooty, Tamil Nadu (PIN: 643001)", "country": "India", "admin1": "Tamil Nadu", "latitude": 11.4102, "longitude": 76.6950, "timezone": "Asia/Kolkata"},
    {"name": "Panaji, Goa (PIN: 403001)", "country": "India", "admin1": "Goa", "latitude": 15.4909, "longitude": 73.8278, "timezone": "Asia/Kolkata"},
    {"name": "Bhubaneswar, Odisha (PIN: 751001)", "country": "India", "admin1": "Odisha", "latitude": 20.2961, "longitude": 85.8245, "timezone": "Asia/Kolkata"},
]

HTTP_HEADERS = {
    "User-Agent": "MausamEnvironmentalIntelligence/2.0 (contact@mausam.app; https://github.com/mausam)"
}

async def search_pincode(query: str) -> List[Dict[str, Any]]:
    """
    Search specifically for Indian 6-digit PIN codes using OpenStreetMap Nominatim
    with fallback to India Post API. Only returns locations inside India.
    """
    clean_code = query.strip()
    pin_match = re.search(r'\b[1-9][0-9]{5}\b', clean_code)
    pin = pin_match.group(0) if pin_match else (clean_code if clean_code.isdigit() and len(clean_code) == 6 else None)

    if not pin:
        return []

    results: List[Dict[str, Any]] = []
    seen_coords = set()

    # 1. Primary: Nominatim postal code search for India
    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=4.5) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "postalcode": pin,
                    "country": "India",
                    "format": "json",
                    "addressdetails": 1,
                    "limit": 5
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                for item in data:
                    addr = item.get("address", {})
                    # Ensure location is strictly inside India
                    country_code = addr.get("country_code", "").lower()
                    if country_code != "in":
                        continue

                    place_name = (
                        addr.get("city")
                        or addr.get("town")
                        or addr.get("village")
                        or addr.get("suburb")
                        or addr.get("hamlet")
                        or addr.get("county")
                        or addr.get("state_district")
                        or f"PIN {pin}"
                    )
                    state = addr.get("state", "")
                    lat = float(item["lat"])
                    lon = float(item["lon"])
                    coord_key = (round(lat, 3), round(lon, 3))

                    if coord_key not in seen_coords:
                        seen_coords.add(coord_key)
                        formatted_name = f"{place_name}, {state} (PIN: {pin})" if state else f"{place_name} (PIN: {pin})"
                        results.append({
                            "name": formatted_name,
                            "country": "India",
                            "admin1": state,
                            "latitude": lat,
                            "longitude": lon,
                            "timezone": "Asia/Kolkata"
                        })
                if results:
                    return results
    except Exception as e:
        print(f"Nominatim pincode lookup error: {e}")

    # 2. Secondary fallback: India Post API
    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=4.5) as client:
            res = await client.get(f"https://api.postalpincode.in/pincode/{pin}")
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0 and data[0].get("Status") == "Success":
                    post_offices = data[0].get("PostOffice", [])
                    if post_offices:
                        # Pick top distinct post offices
                        for po in post_offices[:3]:
                            po_name = po.get("Name", "")
                            district = po.get("District", "")
                            state = po.get("State", "")

                            # Geocode post office or district inside India
                            geo_resp = await client.get(
                                "https://nominatim.openstreetmap.org/search",
                                params={
                                    "q": f"{district or po_name}, {state}",
                                    "countrycodes": "in",
                                    "format": "json",
                                    "limit": 1
                                }
                            )
                            if geo_resp.status_code == 200 and geo_resp.json():
                                m = geo_resp.json()[0]
                                lat = float(m.get("lat"))
                                lon = float(m.get("lon"))
                                coord_key = (round(lat, 3), round(lon, 3))
                                if coord_key not in seen_coords:
                                    seen_coords.add(coord_key)
                                    results.append({
                                        "name": f"{po_name}, {district} (PIN: {pin})",
                                        "country": "India",
                                        "admin1": state,
                                        "latitude": lat,
                                        "longitude": lon,
                                        "timezone": "Asia/Kolkata"
                                    })
                        if results:
                            return results
    except Exception as e:
        print(f"India Post API error: {e}")

    # 3. Fallback matching pre-configured Indian list
    matched = [c for c in INDIAN_FALLBACK_CITIES if pin in c["name"]]
    return matched

async def search_cities(query: str) -> List[Dict[str, Any]]:
    """
    Search exclusively for Indian cities, towns, villages, and PIN codes.
    Outside India locations are strictly excluded.
    """
    if not query or len(query.strip()) < 2:
        return []

    clean_q = query.strip()

    # If query contains 6-digit PIN code or is purely digits, execute PIN code lookup
    pin_match = re.search(r'\b[1-9][0-9]{5}\b', clean_q)
    if pin_match or (clean_q.isdigit() and len(clean_q) in [5, 6]):
        pin_results = await search_pincode(clean_q)
        if pin_results:
            return pin_results

    results: List[Dict[str, Any]] = []
    seen_coords = set()

    # 1. Open-Meteo Geocoding — Strictly filtered for India (country_code == 'IN')
    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=4.0) as client:
            resp = await client.get(
                OPEN_METEO_GEOCODING_URL,
                params={"name": clean_q, "count": 15, "language": "en", "format": "json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    # STRICT FILTER: India only
                    if str(item.get("country_code", "")).upper() == "IN" or str(item.get("country", "")).lower() == "india":
                        searchable_text = f"{item.get('name', '')} {item.get('admin1', '')}".lower()
                        if clean_q.lower() not in searchable_text:
                            continue
                        lat = float(item.get("latitude"))
                        lon = float(item.get("longitude"))
                        coord_key = (round(lat, 3), round(lon, 3))
                        if coord_key not in seen_coords:
                            seen_coords.add(coord_key)
                            results.append({
                                "name": item.get("name"),
                                "country": "India",
                                "admin1": item.get("admin1", ""),
                                "latitude": lat,
                                "longitude": lon,
                                "timezone": item.get("timezone", "Asia/Kolkata")
                            })
    except Exception as e:
        print(f"Open-Meteo geocoding error: {e}")

    # 2. OpenStreetMap Nominatim — Specifically searches Indian towns, villages, tehsils, hamlets
    try:
        async with httpx.AsyncClient(headers=HTTP_HEADERS, timeout=4.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": clean_q,
                    "countrycodes": "in",
                    "format": "json",
                    "addressdetails": 1,
                    "limit": 8
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                for it in data:
                    addr = it.get("address", {})
                    country_code = addr.get("country_code", "").lower()
                    if country_code != "in":
                        continue
                    if clean_q.lower() not in it.get("display_name", "").lower():
                        continue

                    # Determine place title (village, hamlet, town, city, suburb, etc.)
                    place_name = (
                        addr.get("village")
                        or addr.get("town")
                        or addr.get("city")
                        or addr.get("hamlet")
                        or addr.get("suburb")
                        or addr.get("county")
                        or it.get("name")
                    )
                    state = addr.get("state", "")
                    postcode = addr.get("postcode")
                    lat = float(it["lat"])
                    lon = float(it["lon"])
                    coord_key = (round(lat, 3), round(lon, 3))

                    if coord_key not in seen_coords:
                        seen_coords.add(coord_key)
                        formatted_name = place_name
                        if postcode and postcode.isdigit() and len(postcode) == 6:
                            formatted_name = f"{place_name} (PIN: {postcode})"
                        results.append({
                            "name": formatted_name,
                            "country": "India",
                            "admin1": state,
                            "latitude": lat,
                            "longitude": lon,
                            "timezone": "Asia/Kolkata"
                        })
    except Exception as e:
        print(f"Nominatim town/village geocoding error: {e}")

    if results:
        relevant_results = [
            result for result in results
            if clean_q.lower() in f"{result.get('name', '')} {result.get('admin1', '')}".lower()
        ]
        if relevant_results:
            return relevant_results

    # 3. Fallback matching pre-built Indian cities/towns/villages
    matched = [
        c for c in INDIAN_FALLBACK_CITIES
        if clean_q.lower() in c["name"].lower() or (c.get("admin1") and clean_q.lower() in c["admin1"].lower())
    ]
    return matched

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
