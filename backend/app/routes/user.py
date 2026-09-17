from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import SavedLocation, UserPreference
from ..schemas import SavedLocationCreate, SavedLocationResponse, UserPreferenceBase, UserPreferenceResponse

router = APIRouter(prefix="/api/user", tags=["User"])

@router.get("/saved-locations", response_model=List[SavedLocationResponse])
def get_saved_locations(db: Session = Depends(get_db)):
    return db.query(SavedLocation).all()

@router.post("/saved-locations", response_model=SavedLocationResponse)
def add_saved_location(location: SavedLocationCreate, db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(SavedLocation).filter(
        SavedLocation.name == location.name,
        SavedLocation.latitude == location.latitude,
        SavedLocation.longitude == location.longitude
    ).first()
    if existing:
        return existing
    
    db_loc = SavedLocation(**location.model_dump())
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

@router.delete("/saved-locations/{location_id}")
def delete_saved_location(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(SavedLocation).filter(SavedLocation.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Saved location not found")
    db.delete(loc)
    db.commit()
    return {"status": "success", "message": f"Deleted location {location_id}"}

@router.get("/preferences", response_model=UserPreferenceResponse)
def get_user_preferences(db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == "default_user").first()
    if not pref:
        pref = UserPreference(user_id="default_user", default_persona="health")
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(pref_in: UserPreferenceBase, db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == "default_user").first()
    if not pref:
        pref = UserPreference(user_id="default_user", **pref_in.model_dump())
        db.add(pref)
    else:
        pref.default_persona = pref_in.default_persona
        pref.temp_unit = pref_in.temp_unit
        pref.theme = pref_in.theme
        pref.notifications_enabled = pref_in.notifications_enabled
    db.commit()
    db.refresh(pref)
    return pref
