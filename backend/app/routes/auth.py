from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserAuthResponse
from ..security import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ── Password hashing: direct bcrypt with hashlib pbkdf2 fallback ─────────────
import bcrypt
import hashlib
import os

def _hash_password(plain: str) -> str:
    try:
        # bcrypt handles max 72 bytes safely
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(plain.encode("utf-8")[:72], salt).decode("utf-8")
    except Exception:
        salt_hex = os.urandom(16).hex()
        h = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt_hex.encode("utf-8"), 260_000).hex()
        return f"pbkdf2${salt_hex}${h}"

def _verify_password(plain: str, hashed: str) -> bool:
    try:
        if hashed.startswith("$2b$") or hashed.startswith("$2a$") or hashed.startswith("$2y$"):
            return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
        elif hashed.startswith("pbkdf2$"):
            _, salt_hex, h = hashed.split("$", 2)
            computed = hashlib.pbkdf2_hmac(
                "sha256", plain.encode("utf-8"), salt_hex.encode("utf-8"), 260_000
            ).hex()
            return computed == h
        else:
            return plain == hashed
    except Exception:
        return False


# ── Register ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=UserAuthResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Basic validation
    if not user_in.name.strip():
        raise HTTPException(status_code=422, detail="Name cannot be empty.")
    if not user_in.email.strip():
        raise HTTPException(status_code=422, detail="Email cannot be empty.")
    if len(user_in.password) < 6:
        raise HTTPException(
            status_code=422,
            detail="Password must be at least 6 characters long."
        )

    email_clean = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please sign in instead."
        )

    personas = user_in.selected_personas if user_in.selected_personas else ["health"]
    primary = personas[0]

    new_user = User(
        name=user_in.name.strip(),
        email=email_clean,
        password_hash=_hash_password(user_in.password),
        primary_persona=primary,
        selected_personas=json.dumps(personas),
        custom_trade=user_in.custom_trade.strip() if user_in.custom_trade else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(user_id=new_user.id)
    return UserAuthResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        primary_persona=new_user.primary_persona,
        selected_personas=new_user.selected_personas,
        custom_trade=new_user.custom_trade,
        access_token=token,
        token_type="bearer"
    )


# ── Login ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=UserAuthResponse)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    email_clean = user_in.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="No account found with this email. Please create an account first."
        )
    if not _verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password. Please try again."
        )

    token = create_access_token(user_id=user.id)
    return UserAuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        primary_persona=user.primary_persona,
        selected_personas=user.selected_personas,
        custom_trade=user.custom_trade,
        access_token=token,
        token_type="bearer"
    )


# ── Current User Profile ─────────────────────────────────────────────────────
@router.get("/me", response_model=UserAuthResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

