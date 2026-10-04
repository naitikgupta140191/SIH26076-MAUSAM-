import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import weather, user, alerts, auth

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mausam - Multi-Domain Environmental Intelligence API",
    description="Backend API powering domain-tailored weather, AQI, marine, agricultural, and commute intelligence.",
    version="1.0.0"
)

# Configurable CORS origins via FRONTEND_URL or ALLOWED_ORIGINS env variables
raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if raw_origins:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
else:
    # Explicit development origins for Vite (5173) and React (3000)
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

# CORS Middleware setup with explicit allowed origins (never wildcard "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(user.router)
app.include_router(alerts.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Mausam API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
