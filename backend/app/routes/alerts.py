from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import CustomAlert
from ..schemas import CustomAlertCreate, CustomAlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[CustomAlertResponse])
def get_custom_alerts(db: Session = Depends(get_db)):
    return db.query(CustomAlert).all()

@router.post("", response_model=CustomAlertResponse)
def create_custom_alert(alert: CustomAlertCreate, db: Session = Depends(get_db)):
    db_alert = CustomAlert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/{alert_id}")
def delete_custom_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(CustomAlert).filter(CustomAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": f"Deleted alert {alert_id}"}
