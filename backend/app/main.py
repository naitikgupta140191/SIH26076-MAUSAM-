from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import weather, user, alerts

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mausam - Multi-Domain Environmental Intelligence API",
    description="Backend API powering domain-tailored weather, AQI, marine, agricultural, and commute intelligence.",
    version="1.0.0"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
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
