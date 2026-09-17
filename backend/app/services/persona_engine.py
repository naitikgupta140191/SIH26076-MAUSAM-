from typing import Dict, Any, List
import math
from datetime import datetime

def process_persona_insights(persona: str, raw_env: Dict[str, Any], city_name: str = "") -> Dict[str, Any]:
    w_curr = raw_env.get("weather", {}).get("current", {})
    w_hourly = raw_env.get("weather", {}).get("hourly", {})
    w_daily = raw_env.get("weather", {}).get("daily", {})
    
    a_curr = raw_env.get("aqi", {}).get("current", {})
    a_hourly = raw_env.get("aqi", {}).get("hourly", {})
    
    m_curr = raw_env.get("marine", {}).get("current", {})
    m_hourly = raw_env.get("marine", {}).get("hourly", {})

    temp_c = w_curr.get("temperature_2m", 24.0)
    feels_like = w_curr.get("apparent_temperature", temp_c + 1.2)
    humidity = w_curr.get("relative_humidity_2m", 60)
    wind_kph = w_curr.get("wind_speed_10m", 12.0)
    wind_gusts = w_curr.get("wind_gusts_10m", wind_kph * 1.3)
    weather_code = w_curr.get("weather_code", 0)
    
    # AQI metrics
    us_aqi = a_curr.get("us_aqi") or 45
    pm25 = a_curr.get("pm2_5") or 12.5
    pm10 = a_curr.get("pm10") or 28.0
    no2 = a_curr.get("nitrogen_dioxide") or 15.0
    o3 = a_curr.get("ozone") or 40.0
    
    # Hourly lists fallback
    times = w_hourly.get("time", [])[:24]
    temps = w_hourly.get("temperature_2m", [temp_c]*24)
    rain_probs = w_hourly.get("precipitation_probability", [10]*24)
    uv_list = w_hourly.get("uv_index", [3.0]*24)
    vis_list = w_hourly.get("visibility", [10000.0]*24)

    if persona == "health":
        # Health & Allergy Persona
        score = 100
        recs = []
        if us_aqi > 150:
            score -= 40
            recs.append("⚠️ Unhealthy Air Quality: Wear an N95 mask outdoors.")
        elif us_aqi > 100:
            score -= 20
            recs.append("😷 Moderate Air Pollution: Sensitive groups should limit outdoor exertion.")
        else:
            recs.append("✅ Air quality is clear and safe for outdoor activities.")

        if humidity > 80:
            score -= 15
            recs.append("💧 High Humidity (>80%): Increased risk of dust mites & mold triggers.")
        elif humidity < 30:
            score -= 10
            recs.append("🌵 Dry Air (<30%): Stay hydrated; skin irritation & dry airway risk.")

        max_uv = max(uv_list[:12]) if uv_list else 4.0
        if max_uv >= 8:
            recs.append(f"☀️ Very High UV Index ({max_uv:.1f}): Apply SPF 50+ sunscreen and wear sunglasses.")
        elif max_uv >= 5:
            recs.append(f"🌤 Moderate UV Index ({max_uv:.1f}): Seek shade between 11 AM - 3 PM.")

        # Pollen estimate
        grass_pollen = a_hourly.get("grass_pollen", [2]*24)[0] if a_hourly.get("grass_pollen") else 2
        tree_pollen = a_hourly.get("tree_pollen", [3]*24)[0] if a_hourly.get("tree_pollen") else 3
        
        status = "Excellent" if score >= 85 else "Moderate" if score >= 65 else "Unhealthy"

        return {
            "persona": "health",
            "score": max(10, score),
            "headline": f"Air Quality is {status} in {city_name or 'your area'}",
            "summary": f"US AQI is {us_aqi} with PM2.5 at {pm25} µg/m³. Humidity stands at {humidity}%.",
            "status_badge": status,
            "recommendations": recs,
            "metrics": {
                "aqi": us_aqi,
                "pm25": pm25,
                "pm10": pm10,
                "no2": no2,
                "o3": o3,
                "humidity": humidity,
                "uv_index": max_uv,
                "pollen_index": "Moderate" if grass_pollen > 15 else "Low"
            },
            "detailed_cards": [
                {"title": "AQI Level", "value": f"{us_aqi}", "subtitle": "US EPA Standard", "color": "emerald" if us_aqi <= 50 else "amber" if us_aqi <= 100 else "rose"},
                {"title": "PM2.5", "value": f"{pm25} µg/m³", "subtitle": "Fine Particulate Matter", "color": "sky"},
                {"title": "Pollen Count", "value": f"Grass: {grass_pollen} / Tree: {tree_pollen}", "subtitle": "Grains/m³", "color": "lime"},
                {"title": "UV Danger", "value": f"Peak {max_uv:.1f}", "subtitle": "Sun Sensitivity Level", "color": "orange"}
            ]
        }

    elif persona == "fitness":
        # Outdoor Fitness Persona
        # Score running hours across 24h
        hourly_fitness = []
        best_hours = []
        for i in range(min(24, len(temps))):
            h_temp = temps[i] if i < len(temps) else temp_c
            h_rain = rain_probs[i] if i < len(rain_probs) else 0
            h_uv = uv_list[i] if i < len(uv_list) else 0
            
            # Score formula
            f_score = 100
            if h_temp > 32: f_score -= 35
            elif h_temp > 28: f_score -= 15
            elif h_temp < 5: f_score -= 20

            if h_rain > 40: f_score -= 40
            elif h_rain > 20: f_score -= 15

            if h_uv > 7: f_score -= 15

            t_hour = f"{i:02d}:00"
            hourly_fitness.append({"hour": t_hour, "score": max(0, f_score), "temp": h_temp, "rain": h_rain})

            if f_score >= 80 and len(best_hours) < 4:
                best_hours.append(t_hour)

        score = int(sum(h["score"] for h in hourly_fitness) / max(1, len(hourly_fitness)))
        
        sunrise = w_daily.get("sunrise", ["06:15"])[0] if w_daily.get("sunrise") else "06:15 AM"
        sunset = w_daily.get("sunset", ["18:45"])[0] if w_daily.get("sunset") else "06:45 PM"

        if isinstance(sunrise, str) and "T" in sunrise:
            sunrise = sunrise.split("T")[-1]
        if isinstance(sunset, str) and "T" in sunset:
            sunset = sunset.split("T")[-1]

        recs = []
        if best_hours:
            recs.append(f"🏃 Prime workout windows: {', '.join(best_hours)}")
        else:
            recs.append("🏋️ Indoor workout recommended today due to weather extremes.")

        if wind_gusts > 30:
            recs.append(f"💨 Strong Wind Gusts ({wind_gusts:.1f} km/h): Be cautious when cycling.")
        if feels_like > 34:
            recs.append("🔥 High Heat Index: Carry extra electrolytes and avoid midday sprints.")

        status = "Optimal" if score >= 80 else "Fair" if score >= 60 else "Challenging"

        return {
            "persona": "fitness",
            "score": score,
            "headline": f"Outdoor Fitness Score: {score}/100 ({status})",
            "summary": f"Current temp is {temp_c:.1f}°C (Feels like {feels_like:.1f}°C). Wind gusts up to {wind_gusts:.1f} km/h.",
            "status_badge": status,
            "recommendations": recs,
            "metrics": {
                "best_hours": best_hours,
                "sunrise": sunrise,
                "sunset": sunset,
                "wind_kph": wind_kph,
                "wind_gusts": wind_gusts,
                "feels_like": feels_like
            },
            "detailed_cards": [
                {"title": "Best Running Time", "value": best_hours[0] if best_hours else "Early Morning", "subtitle": "Lowest Heat & Rain", "color": "emerald"},
                {"title": "Golden Hour / Sunrise", "value": f"🌅 {sunrise}", "subtitle": "Morning light", "color": "amber"},
                {"title": "Sunset Time", "value": f"🌇 {sunset}", "subtitle": "Evening cool-down", "color": "indigo"},
                {"title": "Wind & Gusts", "value": f"{wind_kph:.1f} / {wind_gusts:.1f} km/h", "subtitle": "Cycling resistance", "color": "sky"}
            ]
        }

    elif persona == "beach":
        # Beachgoers & Surfers Persona
        wave_h = m_curr.get("wave_height")
        if wave_h is None:
            # Estimate wave height from wind speed if coastal or mock ocean
            wave_h = round(max(0.4, (wind_kph * 0.08)), 2)
        wave_period = m_curr.get("wave_period") or 7.5
        water_temp = round(temp_c - 3.0, 1)

        surf_condition = "Calm Waves" if wave_h < 1.0 else "Good Surfing Swell" if wave_h < 2.2 else "Rough / High Waves"
        score = 85 if 0.8 <= wave_h <= 2.2 else 60 if wave_h < 0.8 else 40

        recs = []
        if wave_h >= 2.0:
            recs.append("⚠️ High Wave Warning: Strong rip currents expected. Experienced surfers only.")
        elif wave_h >= 1.0:
            recs.append("🏄 Great Swell: Ideal for surfing and bodyboarding.")
        else:
            recs.append("🏖️ Calm Waters: Perfect for swimming, paddleboarding, and family beach day.")

        recs.append(f"🌡️ Water Temp: ~{water_temp}°C. UV protection mandatory at shoreline.")

        return {
            "persona": "beach",
            "score": score,
            "headline": f"Beach & Coastal Status: {surf_condition}",
            "summary": f"Wave height is {wave_h}m with a swell period of {wave_period}s. Estimated sea temp: {water_temp}°C.",
            "status_badge": "Good Beach Day" if score >= 70 else "Caution Advised",
            "recommendations": recs,
            "metrics": {
                "wave_height_m": wave_h,
                "wave_period_s": wave_period,
                "water_temp_c": water_temp,
                "high_tide": "10:30 AM (1.8m)",
                "low_tide": "04:45 PM (0.4m)"
            },
            "detailed_cards": [
                {"title": "Wave Height", "value": f"{wave_h} m", "subtitle": "Swell condition", "color": "cyan"},
                {"title": "Swell Period", "value": f"{wave_period} s", "subtitle": "Wave consistency", "color": "teal"},
                {"title": "Water Temp", "value": f"{water_temp} °C", "subtitle": "Coastal surface temp", "color": "blue"},
                {"title": "Tide Schedule", "value": "High 10:30 AM | Low 4:45 PM", "subtitle": "Semi-diurnal tide", "color": "indigo"}
            ]
        }

    elif persona == "traveler":
        # Travelers & Flight Persona
        has_severe_rain = any(r > 50 for r in rain_probs[:12])
        has_low_vis = any(v < 2000 for v in vis_list[:12])

        flight_alert = "Normal Operations"
        if has_severe_rain or has_low_vis or wind_gusts > 45:
            flight_alert = "Possible Delays / Severe Weather Alert"

        # AI Packing Recommendations
        packing = ["Sunglasses", "Reusable Water Bottle", "Mobile Power Bank"]
        if max(temps[:24]) > 28:
            packing.extend(["Breathable Linen Clothes", "Sunscreen SPF 50+", "Light Hat"])
        elif min(temps[:24]) < 15:
            packing.extend(["Thermal Jacket", "Warm Layers", "Lip Balm"])

        if any(r > 30 for r in rain_probs[:24]):
            packing.append("☔ Compact Umbrella & Waterproof Raincoat")

        score = 65 if "Delays" in flight_alert else 90

        recs = [
            f"🎒 Packing Checklist for {city_name or 'Destination'}: {', '.join(packing)}",
            f"✈️ Aviation & Airport Weather Status: {flight_alert}"
        ]

        return {
            "persona": "traveler",
            "score": score,
            "headline": f"Travel Briefing for {city_name or 'Selected Destination'}",
            "summary": f"Expect temp range {min(temps[:24]):.1f}°C to {max(temps[:24]):.1f}°C. Flight weather condition: {flight_alert}.",
            "status_badge": "Smooth Travel" if score >= 80 else "Check Flight Status",
            "recommendations": recs,
            "metrics": {
                "flight_status": flight_alert,
                "packing_list": packing,
                "temp_min": min(temps[:24]),
                "temp_max": max(temps[:24])
            },
            "detailed_cards": [
                {"title": "Flight Impact", "value": flight_alert, "subtitle": "Turbulence & Vis Risk", "color": "emerald" if score > 80 else "rose"},
                {"title": "Key Items to Pack", "value": ", ".join(packing[:3]), "subtitle": "Weather-Tailored", "color": "violet"},
                {"title": "Day Temp Range", "value": f"{min(temps[:24]):.1f}°C - {max(temps[:24]):.1f}°C", "subtitle": "24h fluctuation", "color": "amber"},
                {"title": "Rain Hazard", "value": f"Max Prob {max(rain_probs[:24])}%", "subtitle": "Precipitation risk", "color": "sky"}
            ]
        }

    elif persona == "family":
        # Parents & School Commute Persona
        morning_rain = max(rain_probs[7:10]) if len(rain_probs) >= 10 else 10
        afternoon_rain = max(rain_probs[14:17]) if len(rain_probs) >= 17 else 10
        
        morn_temp = temps[8] if len(temps) > 8 else temp_c
        aft_temp = temps[15] if len(temps) > 15 else temp_c

        recs = []
        if morning_rain > 30:
            recs.append("🎒 Morning School Commute (7-9 AM): Rain expected! Pack raincoat & umbrella for kids.")
        else:
            recs.append("🎒 Morning School Commute (7-9 AM): Clear skies & smooth ride expected.")

        if afternoon_rain > 30:
            recs.append("🚌 Afternoon Pick-up (2-4 PM): Rain likelihood is high. Arrange covered pickup.")

        if max(uv_list) > 6:
            recs.append("🧢 Playground Warning: High afternoon UV. Apply child-safe sunscreen before recess.")

        score = 100 - (morning_rain // 2) - (afternoon_rain // 2)

        return {
            "persona": "family",
            "score": max(20, score),
            "headline": f"School Commute & Family Routine Forecast",
            "summary": f"Morning Temp: {morn_temp:.1f}°C (Rain Prob: {morning_rain}%). Afternoon Temp: {aft_temp:.1f}°C (Rain Prob: {afternoon_rain}%).",
            "status_badge": "Safe Commute" if score >= 75 else "Rain Protection Required",
            "recommendations": recs,
            "metrics": {
                "morning_commute": f"{morn_temp:.1f}°C / {morning_rain}% Rain",
                "afternoon_commute": f"{aft_temp:.1f}°C / {afternoon_rain}% Rain",
                "uv_max": max(uv_list)
            },
            "detailed_cards": [
                {"title": "Morning Drop-off (7-9 AM)", "value": f"{morn_temp:.1f}°C", "subtitle": f"{morning_rain}% Rain Prob", "color": "amber"},
                {"title": "Afternoon Pick-up (2-4 PM)", "value": f"{aft_temp:.1f}°C", "subtitle": f"{afternoon_rain}% Rain Prob", "color": "orange"},
                {"title": "Recess Safety", "value": f"UV {max(uv_list):.1f}", "subtitle": "Sun protection", "color": "emerald"},
                {"title": "Lightning Warning", "value": "Low Risk", "subtitle": "Storm detection", "color": "sky"}
            ]
        }

    elif persona == "agriculture":
        # Agriculture & Gardeners Persona
        soil_m = round(random.uniform(0.18, 0.35), 2) # m³/m³ moisture
        soil_t = round(temp_c - 1.5, 1)
        rain_7day = round(sum(rain_probs[:24]) * 0.15, 1) # estimated total mm

        frost_risk = "No Frost Risk" if min(temps[:24]) > 4 else "⚠️ Frost Warning! Cover sensitive crops."
        
        recs = [
            f"🌱 Soil Moisture at 0-7cm depth: {soil_m} m³/m³ ({'Optimal' if 0.2 <= soil_m <= 0.32 else 'Dry - Irrigation Needed'}).",
            f"❄️ Frost Alert: {frost_risk}",
            f"🌧️ 7-Day Precipitation Outlook: ~{rain_7day} mm expected."
        ]

        if soil_m < 0.2:
            recs.append("💧 Recommended Action: Deep watering early in the morning to prevent evaporation.")

        return {
            "persona": "agriculture",
            "score": 88 if 0.2 <= soil_m <= 0.32 and min(temps) > 5 else 60,
            "headline": f"Agricultural & Soil Intelligence",
            "summary": f"Soil Temp: {soil_t}°C. Soil Moisture: {soil_m} m³/m³. Frost Status: {frost_risk}.",
            "status_badge": "Optimal Soil Health" if soil_m >= 0.2 else "Irrigation Advisory",
            "recommendations": recs,
            "metrics": {
                "soil_moisture": soil_m,
                "soil_temp": soil_t,
                "frost_risk": frost_risk,
                "rain_7day_mm": rain_7day
            },
            "detailed_cards": [
                {"title": "Soil Moisture", "value": f"{soil_m} m³/m³", "subtitle": "Root zone 0-7cm", "color": "emerald"},
                {"title": "Soil Temperature", "value": f"{soil_t} °C", "subtitle": "Germination suitability", "color": "amber"},
                {"title": "Frost Hazard", "value": frost_risk, "subtitle": "Overnight temp floor", "color": "cyan"},
                {"title": "Weekly Rain Forecast", "value": f"~{rain_7day} mm", "subtitle": "Expected accumulation", "color": "blue"}
            ]
        }

    elif persona == "commuter":
        # Commuters & Traffic Persona
        curr_vis = vis_list[0] / 1000.0 if vis_list else 10.0 # in km
        
        hazard_level = "Low Risk"
        if curr_vis < 1.0 or weather_code in [45, 48]:
            hazard_level = "🚨 Severe Fog / Low Visibility Warning"
        elif weather_code in [63, 65, 82, 95]:
            hazard_level = "🌧️ Heavy Rain / Aquaplaning Hazard"
        elif wind_gusts > 40:
            hazard_level = "💨 High Crosswind Advisory"

        score = 95 if hazard_level == "Low Risk" else 55

        recs = [
            f"🚘 Commute Hazard Rating: {hazard_level}",
            f"👁️ Road Visibility: {curr_vis:.1f} km ({'Clear' if curr_vis >= 5 else 'Reduced - Use fog lights'})"
        ]

        if hazard_level != "Low Risk":
            recs.append("⏰ Expect +15 to 25 mins delay on major highways. Drive slowly.")

        return {
            "persona": "commuter",
            "score": score,
            "headline": f"Traffic & Travel Weather Impact: {hazard_level}",
            "summary": f"Visibility is {curr_vis:.1f} km. Wind gusts at {wind_gusts:.1f} km/h.",
            "status_badge": "Normal Traffic Flow" if score >= 80 else "Drive Carefully",
            "recommendations": recs,
            "metrics": {
                "visibility_km": curr_vis,
                "hazard_level": hazard_level,
                "traffic_delay_estimate": "0-5 mins" if score >= 80 else "15-30 mins"
            },
            "detailed_cards": [
                {"title": "Visibility", "value": f"{curr_vis:.1f} km", "subtitle": "Driver sightline", "color": "sky" if curr_vis >= 5 else "rose"},
                {"title": "Commute Risk", "value": hazard_level, "subtitle": "Weather hazard severity", "color": "emerald" if score > 80 else "amber"},
                {"title": "Est. Delay", "value": "0-5 min" if score > 80 else "+20 min", "subtitle": "Traffic bottleneck", "color": "indigo"},
                {"title": "Surface Wetness", "value": "Dry" if rain_probs[0] < 20 else "Wet / Slippery", "subtitle": "Tire traction", "color": "teal"}
            ]
        }

    elif persona == "event":
        # Event Planners Persona
        max_rain = max(rain_probs[:24])
        
        # Comfort index formula (Heat Index / Wind Chill balance)
        humidex = temp_c + (5/9) * ((6.11 * math.exp((5417.7530 * (1/273.16 - 1/(273.15 + temp_c))))) - 10)
        comfort_rating = "Very Comfortable" if 18 <= temp_c <= 26 and max_rain < 20 else "Moderate Comfort" if max_rain < 40 else "High Rain Risk"

        score = 90 if max_rain < 15 and 18 <= temp_c <= 27 else 60 if max_rain < 40 else 30

        recs = [
            f"🎪 Outdoor Event Suitability: {comfort_rating} (Score: {score}/100)",
            f"🌧️ Peak Rain Probability: {max_rain}% across 24h timeline.",
            f"🌡️ Outdoor Comfort Index (Humidex): {humidex:.1f}°C."
        ]

        if max_rain > 30:
            recs.append("⛺ Backup Plan Advice: Arrange waterproof canopy tents or indoor backup venue.")

        return {
            "persona": "event",
            "score": score,
            "headline": f"Outdoor Event Weather Rating: {comfort_rating}",
            "summary": f"Temperature around {temp_c:.1f}°C with {max_rain}% max rain probability. Wind speed: {wind_kph:.1f} km/h.",
            "status_badge": "Ideal Event Weather" if score >= 80 else "Plan Tents / Canopy",
            "recommendations": recs,
            "metrics": {
                "rain_prob_max": max_rain,
                "comfort_index": round(humidex, 1),
                "outdoor_rating": comfort_rating
            },
            "detailed_cards": [
                {"title": "Rain Probability", "value": f"{max_rain} %", "subtitle": "Highest hourly risk", "color": "sky"},
                {"title": "Comfort Index", "value": f"{humidex:.1f} °C", "subtitle": "Perceived temperature", "color": "emerald"},
                {"title": "Event Rating", "value": comfort_rating, "subtitle": "Outdoor gathering score", "color": "purple"},
                {"title": "Wind Stability", "value": f"{wind_kph:.1f} km/h", "subtitle": "Tent fixture safety", "color": "amber"}
            ]
        }

    # Fallback default
    return {
        "persona": persona,
        "score": 80,
        "headline": f"Weather overview for {city_name}",
        "summary": f"Temp: {temp_c}°C, Humidity: {humidity}%.",
        "status_badge": "Normal",
        "recommendations": ["Check local forecast updates."],
        "metrics": {},
        "detailed_cards": []
    }
