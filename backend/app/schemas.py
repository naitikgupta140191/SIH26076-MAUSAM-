from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SavedLocationBase(BaseModel):
    name: str
    country: str = ""
    latitude: float
    longitude: float
    is_favorite: bool = False

class SavedLocationCreate(SavedLocationBase):
    pass

class SavedLocationResponse(SavedLocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserPreferenceBase(BaseModel):
    default_persona: str = "health"
    temp_unit: str = "C"
    theme: str = "dark"
    notifications_enabled: bool = True

class UserPreferenceResponse(UserPreferenceBase):
    id: int
    user_id: str

    class Config:
        from_attributes = True

class CustomAlertBase(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    persona: str
    metric: str
    threshold_value: float
    condition: str
    alert_message: str

class CustomAlertCreate(CustomAlertBase):
    pass

class CustomAlertResponse(CustomAlertBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Weather API Data Schemas
class WeatherLocation(BaseModel):
    name: str
    country: str
    latitude: float
    longitude: float
    timezone: str = "UTC"

class CurrentWeather(BaseModel):
    temp_c: float
    feels_like_c: float
    humidity: int
    wind_kph: float
    wind_dir: str
    uv_index: float
    visibility_km: float
    pressure_mb: float
    condition: str
    code: int
    is_day: int

class HourlyForecastItem(BaseModel):
    time: str
    temp_c: float
    rain_prob: int
    rain_mm: float
    humidity: int
    wind_kph: float
    uv_index: float
    aqi: Optional[int] = None
    visibility_km: Optional[float] = None

class PersonaInsight(BaseModel):
    persona: str
    score: int # 0 to 100
    headline: str
    summary: str
    status_badge: str # 'Excellent', 'Good', 'Moderate', 'Caution', 'Severe Risk'
    recommendations: List[str]
    metrics: Dict[str, Any]
    detailed_cards: List[Dict[str, Any]]
