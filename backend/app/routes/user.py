from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import SavedLocation, UserPreference, User
from ..schemas import SavedLocationCreate, SavedLocationResponse, UserPreferenceBase, UserPreferenceResponse
from ..security import get_current_user

router = APIRouter(prefix="/api/user", tags=["User"])

@router.get("/saved-locations", response_model=List[SavedLocationResponse])
def get_saved_locations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SavedLocation).filter(SavedLocation.user_id == current_user.id).all()

@router.post("/saved-locations", response_model=SavedLocationResponse)
def add_saved_location(
    location: SavedLocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if exists for the current user
    existing = db.query(SavedLocation).filter(
        SavedLocation.user_id == current_user.id,
        SavedLocation.name == location.name,
        SavedLocation.latitude == location.latitude,
        SavedLocation.longitude == location.longitude
    ).first()
    if existing:
        return existing

    db_loc = SavedLocation(**location.model_dump(), user_id=current_user.id)
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

@router.get("/saved-locations/{location_id}", response_model=SavedLocationResponse)
def get_saved_location_by_id(
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == current_user.id
    ).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved location not found")
    return loc

@router.put("/saved-locations/{location_id}", response_model=SavedLocationResponse)
def update_saved_location(
    location_id: int,
    location_in: SavedLocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == current_user.id
    ).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved location not found")
    loc.name = location_in.name
    loc.country = location_in.country
    loc.latitude = location_in.latitude
    loc.longitude = location_in.longitude
    loc.is_favorite = location_in.is_favorite
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/saved-locations/{location_id}")
def delete_saved_location(
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == current_user.id
    ).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved location not found")
    db.delete(loc)
    db.commit()
    return {"status": "success", "message": f"Deleted location {location_id}"}


@router.get("/preferences", response_model=UserPreferenceResponse)
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == str(current_user.id)).first()
    if not pref:
        pref = UserPreference(user_id=str(current_user.id), default_persona=current_user.primary_persona or "health")
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(
    pref_in: UserPreferenceBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == str(current_user.id)).first()
    if not pref:
        pref = UserPreference(user_id=str(current_user.id), **pref_in.model_dump())
        db.add(pref)
    else:
        pref.default_persona = pref_in.default_persona
        pref.temp_unit = pref_in.temp_unit
        pref.theme = pref_in.theme
        pref.notifications_enabled = pref_in.notifications_enabled
    db.commit()
    db.refresh(pref)
    return pref

