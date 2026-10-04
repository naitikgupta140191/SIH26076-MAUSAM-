from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import CustomAlert, User
from ..schemas import CustomAlertCreate, CustomAlertResponse
from ..security import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[CustomAlertResponse])
def get_custom_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CustomAlert).filter(CustomAlert.user_id == current_user.id).all()

@router.post("", response_model=CustomAlertResponse)
def create_custom_alert(
    alert: CustomAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_alert = CustomAlert(**alert.model_dump(), user_id=current_user.id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/{alert_id}")
def delete_custom_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(CustomAlert).filter(
        CustomAlert.id == alert_id,
        CustomAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": f"Deleted alert {alert_id}"}

