from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from .database import Base

class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    country = Column(String, default="")
    latitude = Column(Float)
    longitude = Column(Float)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="default_user", index=True)
    default_persona = Column(String, default="health")
    temp_unit = Column(String, default="C") # C or F
    theme = Column(String, default="dark")
    notifications_enabled = Column(Boolean, default=True)

class CustomAlert(Base):
    __tablename__ = "custom_alerts"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    persona = Column(String)
    metric = Column(String) # e.g. AQI, Rain, UV, Wind
    threshold_value = Column(Float)
    condition = Column(String) # 'gt' or 'lt'
    alert_message = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
