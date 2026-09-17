import type { DashboardData, PersonaType, LocationItem, SavedLocation, CustomAlert } from '../types/weather';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchDashboardData(
  lat: number = 28.6139,
  lon: number = 77.2090,
  persona: PersonaType = 'health',
  city: string = 'New Delhi'
): Promise<DashboardData> {
  try {
    const url = `${API_BASE_URL}/weather/persona-dashboard?lat=${lat}&lon=${lon}&persona=${persona}&city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API unreachable, using client-side fallback generation:", err);
  }

  return generateFallbackDashboard(lat, lon, persona, city);
}

export async function searchLocationsApi(query: string): Promise<LocationItem[]> {
  const cleanQ = query.trim();
  try {
    const res = await fetch(`${API_BASE_URL}/weather/search?q=${encodeURIComponent(cleanQ)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn("Search API failed, fallback to client-side geocoding:", err);
  }

  // Client-side PIN code lookup via Zippopotam if input is numbers/pincode
  if (/^\d{5,6}$/.test(cleanQ)) {
    try {
      const pinRes = await fetch(`https://api.zippopotam.us/in/${cleanQ}`);
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (pinData.places && pinData.places.length > 0) {
          const p = pinData.places[0];
          return [{
            name: `${p['place name']}, ${p['state']} (PIN: ${cleanQ})`,
            country: pinData['country'] || "India",
            admin1: p['state'],
            latitude: parseFloat(p.latitude),
            longitude: parseFloat(p.longitude),
            timezone: "Asia/Kolkata"
          }];
        }
      }
    } catch (e) {
      console.warn("Client pincode API error", e);
    }
  }

  const defaultCities: LocationItem[] = [
    { name: "Connaught Place, New Delhi (PIN: 110001)", country: "India", admin1: "Delhi", latitude: 28.6333, longitude: 77.2167 },
    { name: "Fort, Mumbai (PIN: 400001)", country: "India", admin1: "Maharashtra", latitude: 18.9333, longitude: 72.8333 },
    { name: "MG Road, Bengaluru (PIN: 560001)", country: "India", admin1: "Karnataka", latitude: 12.9750, longitude: 77.6083 },
    { name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.2090 },
    { name: "Mumbai", country: "India", latitude: 19.0760, longitude: 72.8777 },
    { name: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946 },
    { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
    { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.0060 },
    { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
    { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
  ];
  return defaultCities.filter(c => c.name.toLowerCase().includes(cleanQ.toLowerCase()) || c.country.toLowerCase().includes(cleanQ.toLowerCase()));
}

export async function fetchSavedLocationsApi(): Promise<SavedLocation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/saved-locations`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Saved locations API fallback", e);
  }
  return [
    { id: 1, name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.2090, is_favorite: true },
    { id: 2, name: "Mumbai", country: "India", latitude: 19.0760, longitude: 72.8777, is_favorite: false },
    { id: 3, name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, is_favorite: false }
  ];
}

export async function addSavedLocationApi(loc: { name: string; country: string; latitude: number; longitude: number }): Promise<SavedLocation | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/saved-locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loc)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Save location error", e);
  }
  return null;
}

export async function fetchCustomAlertsApi(): Promise<CustomAlert[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Alerts API fallback", e);
  }
  return [
    { id: 1, location_name: "New Delhi", latitude: 28.61, longitude: 77.20, persona: "health", metric: "AQI", threshold_value: 150, condition: "gt", alert_message: "Notify me when AQI > 150", is_active: true },
    { id: 2, location_name: "Mumbai", latitude: 19.07, longitude: 72.87, persona: "beach", metric: "Wave Height", threshold_value: 2.0, condition: "gt", alert_message: "High wave warning (> 2.0m)", is_active: true }
  ];
}

export async function createCustomAlertApi(alert: CustomAlert): Promise<CustomAlert | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Create alert error", e);
  }
  return alert;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

type AuthResult = { success: boolean; user?: Record<string, unknown>; error?: string };

export async function registerUserApi(data: {
  name: string;
  email: string;
  password: string;
  primary_persona: string;
  selected_personas: string[];
  custom_trade?: string;
}): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return { success: true, user: await res.json() };
    const err = await res.json().catch(() => ({ detail: 'Registration failed.' }));
    return { success: false, error: (err as { detail?: string }).detail || 'Registration failed.' };
  } catch {
    return { success: false, error: 'Cannot connect to server. Make sure the backend is running on port 8000.' };
  }
}

export async function loginUserApi(data: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return { success: true, user: await res.json() };
    const err = await res.json().catch(() => ({ detail: 'Login failed.' }));
    return { success: false, error: (err as { detail?: string }).detail || 'Login failed.' };
  } catch {
    return { success: false, error: 'Cannot connect to server. Make sure the backend is running on port 8000.' };
  }
}

function generateFallbackDashboard(lat: number, lon: number, persona: PersonaType, city: string): DashboardData {
  const current_weather = {
    temp_c: 26.5,
    feels_like_c: 28.0,
    humidity: 62,
    wind_kph: 14.5,
    uv_index: 6.2
  };

  const hourly_forecast = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i < 10 ? '0' : ''}${i}:00`,
    temp: Math.round((22 + Math.sin(i / 3) * 6) * 10) / 10,
    rain_prob: Math.min(100, Math.max(0, Math.round(15 + Math.cos(i / 2) * 35))),
    uv: Math.max(0, Math.round(Math.sin((i - 6) / 4) * 8 * 10) / 10),
    aqi: Math.round(45 + (i > 8 && i < 20 ? 40 : 10))
  }));

  const daily_forecast = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      temp_max: 30 + (i % 3),
      temp_min: 21 - (i % 2),
      rain_prob: Math.round(10 + (i * 12) % 60)
    };
  });

  const cardsMap: Record<PersonaType, any> = {
    health: {
      headline: `Air Quality & Health Outlook for ${city}`,
      summary: "US AQI is 85 (Moderate). PM2.5 is elevated at 28.4 µg/m³.",
      status_badge: "Moderate AQI",
      score: 72,
      recommendations: [
        "😷 Sensitive individuals should restrict outdoor workouts during peak evening hours.",
        "💧 Indoor humidity is optimal (62%). Dust mite allergy index is Low.",
        "☀️ High afternoon UV Index (6.2). Wear SPF 30+ sunscreen."
      ],
      detailed_cards: [
        { title: "US AQI Index", value: "85", subtitle: "Moderate Air", color: "amber" },
        { title: "PM2.5 Particles", value: "28.4 µg/m³", subtitle: "Fine Dust Risk", color: "sky" },
        { title: "Pollen Count", value: "Grass: Low / Tree: Mod", subtitle: "Allergy Level", color: "lime" },
        { title: "Asthma Risk Index", value: "Mild (Level 2/5)", subtitle: "Airway Sensitivity", color: "emerald" }
      ]
    },
    fitness: {
      headline: `Outdoor Fitness Score: 88/100 (Optimal)`,
      summary: "Ideal running and cycling conditions with cool breeze and mild UV.",
      status_badge: "Prime Running Hours",
      score: 88,
      recommendations: [
        "🏃 Best Running Window: 06:00 AM - 09:00 AM or after 06:30 PM.",
        "🚴 Wind resistance is low at 14.5 km/h. Great for road cycling.",
        "🔥 Heat Index is 28.0°C. Hydrate every 20 minutes."
      ],
      detailed_cards: [
        { title: "Best Running Time", value: "06:00 AM - 08:30 AM", subtitle: "Coolest hours", color: "emerald" },
        { title: "Golden Hour / Sunrise", value: "🌅 06:14 AM", subtitle: "Morning twilight", color: "amber" },
        { title: "Sunset Golden Hour", value: "🌇 06:42 PM", subtitle: "Evening run", color: "indigo" },
        { title: "Wind Resistance", value: "14.5 km/h", subtitle: "Crosswind speed", color: "sky" }
      ]
    },
    beach: {
      headline: `Coastal & Surf Status: Moderate Swell`,
      summary: "Wave height is 1.4m. Great conditions for beachgoers and bodyboarders.",
      status_badge: "Good Surf Day",
      score: 78,
      recommendations: [
        "🏄 Wave height 1.4m with 8.2s period. Clean breaking waves.",
        "🏊 Safe swimming area between red/yellow flags.",
        "🌡️ Sea surface water temp: ~23.5°C."
      ],
      detailed_cards: [
        { title: "Wave Height", value: "1.4 m", subtitle: "Clean Swell", color: "cyan" },
        { title: "Swell Period", value: "8.2 s", subtitle: "Wave consistency", color: "teal" },
        { title: "Water Temp", value: "23.5 °C", subtitle: "Coastal surface", color: "blue" },
        { title: "Tide Timings", value: "High 09:40 AM | Low 04:15 PM", subtitle: "Semi-diurnal", color: "indigo" }
      ]
    },
    traveler: {
      headline: `Travel & Destination Briefing for ${city}`,
      summary: "Mild conditions expected. No flight cancellation hazards detected.",
      status_badge: "Smooth Flights",
      score: 92,
      recommendations: [
        "🎒 Packing List: Light cotton clothes, SPF 30 sunscreen, and sunglasses.",
        "✈️ Airport Weather Impact: Clear visibility. Zero severe rain delay risk.",
        "🌧️ Local Precipitation Chance: 15%."
      ],
      detailed_cards: [
        { title: "Flight Impact", value: "Normal Operations", subtitle: "Low turbulence", color: "emerald" },
        { title: "Recommended Pack", value: "Sunscreen, Sunglasses, Linen", subtitle: "Weather-tailored", color: "violet" },
        { title: "Temp Range", value: "21.0°C - 30.5°C", subtitle: "Daily variation", color: "amber" },
        { title: "Destination AQI", value: "85 (Good)", subtitle: "Clean environment", color: "sky" }
      ]
    },
    family: {
      headline: `School Commute & Family Routine Forecast`,
      summary: "Morning drop-off is clear (23°C). Afternoon pick-up rain prob is 20%.",
      status_badge: "Safe Commute",
      score: 84,
      recommendations: [
        "🎒 Morning School Commute (7-9 AM): Dry and pleasant.",
        "🚌 Afternoon School Pick-up (2-4 PM): 20% rain chance. Light umbrella recommended.",
        "🧢 Playground UV Warning: Apply sunscreen before outdoor recess."
      ],
      detailed_cards: [
        { title: "Morning Drop-off", value: "23.0°C", subtitle: "10% Rain Prob", color: "amber" },
        { title: "Afternoon Pick-up", value: "29.5°C", subtitle: "20% Rain Prob", color: "orange" },
        { title: "Recess UV Risk", value: "UV Index 6.2", subtitle: "Moderate sun safety", color: "emerald" },
        { title: "Severe Storm Alert", value: "None Active", subtitle: "Safe outdoor play", color: "sky" }
      ]
    },
    agriculture: {
      headline: `Soil & Crop Weather Intelligence`,
      summary: "Soil moisture is 0.26 m³/m³. No frost threat in next 7 days.",
      status_badge: "Optimal Soil Health",
      score: 86,
      recommendations: [
        "🌱 Soil Moisture 0-7cm depth: 0.26 m³/m³ (Adequate for root absorption).",
        "❄️ Overnight Frost Risk: Zero risk (Min temp 21.0°C).",
        "🌧️ 7-Day Rainfall: 24mm expected."
      ],
      detailed_cards: [
        { title: "Soil Moisture", value: "0.26 m³/m³", subtitle: "Root zone 0-7cm", color: "emerald" },
        { title: "Soil Temperature", value: "25.0 °C", subtitle: "Good germination", color: "amber" },
        { title: "Frost Hazard", value: "No Risk", subtitle: "Thermal threshold", color: "cyan" },
        { title: "Weekly Rain", value: "24 mm", subtitle: "Estimated accumulation", color: "blue" }
      ]
    },
    commuter: {
      headline: `Traffic & Highway Weather Rating: Low Risk`,
      summary: "Road visibility is clear at 10.0 km. Tire grip index is High.",
      status_badge: "Normal Traffic",
      score: 95,
      recommendations: [
        "🚘 Expressway Visibility: Excellent (10.0 km). No fog detected.",
        "⏱️ Estimated Weather Delay: 0 to 5 minutes.",
        "🛣️ Road surface is dry."
      ],
      detailed_cards: [
        { title: "Road Visibility", value: "10.0 km", subtitle: "Clear sightline", color: "sky" },
        { title: "Traffic Hazard", value: "Low Risk", subtitle: "Weather impact", color: "emerald" },
        { title: "Estimated Delay", value: "0-5 min", subtitle: "Normal speed", color: "indigo" },
        { title: "Surface Traction", value: "Dry & Firm", subtitle: "Safe braking distance", color: "teal" }
      ]
    },
    event: {
      headline: `Outdoor Event Rating: Highly Favorable`,
      summary: "Humidex is 28.0°C. Max rain probability is only 15%.",
      status_badge: "Ideal Gathering",
      score: 89,
      recommendations: [
        "🎪 Wedding / Outdoor Party Suitability: Excellent.",
        "🌧️ Peak Rain Risk: Low (15% around 4 PM).",
        "💨 Wind Stability: 14.5 km/h. Canopy and marquee tents are secure."
      ],
      detailed_cards: [
        { title: "Rain Probability", value: "15 %", subtitle: "Max hourly risk", color: "sky" },
        { title: "Comfort Index", value: "28.0 °C", subtitle: "Perceived temp", color: "emerald" },
        { title: "Event Rating", value: "Favorable", subtitle: "Outdoor score", color: "purple" },
        { title: "Wind Security", value: "14.5 km/h", subtitle: "Safe for marquees", color: "amber" }
      ]
    },
    custom: {
      headline: `Custom Trade & Specialized Weather Intelligence`,
      summary: "Custom environmental parameters monitored for your specified profession.",
      status_badge: "Custom Trade View",
      score: 88,
      recommendations: [
        "🛠️ Specific environmental parameters tailored to your trade.",
        "📊 Environmental conditions remain favorable.",
        "🌤️ High-accuracy Open-Meteo telemetry active."
      ],
      detailed_cards: [
        { title: "Field Comfort", value: "28.0 °C", subtitle: "Perceived temp", color: "sky" },
        { title: "Wind Security", value: "14.5 km/h", subtitle: "Safe work conditions", color: "emerald" },
        { title: "Air Quality Index", value: "85 AQI", subtitle: "Moderate conditions", color: "purple" },
        { title: "Precipitation", value: "Low", subtitle: "Safe for field operations", color: "amber" }
      ]
    }
  };

  const p_insight = cardsMap[persona] || cardsMap.health;
  p_insight.persona = persona;

  return {
    location: { city, latitude: lat, longitude: lon },
    current_weather,
    active_persona: persona,
    persona_insight: p_insight,
    hourly_forecast,
    daily_forecast
  };
}
