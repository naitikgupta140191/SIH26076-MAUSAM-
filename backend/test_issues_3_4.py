"""
Test Suite for Issue #3 (Remove Random Soil Moisture) & Issue #4 (Fix CORS Wildcard)
"""
import sys
import os
import re
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.services.persona_engine import process_persona_insights
from backend.app.security import create_access_token

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING TEST SUITE FOR ISSUE #3 & ISSUE #4")
    print("=" * 60)

    # ── ISSUE #3 TESTS ──────────────────────────────────────────────────────────
    print("\n[ISSUE #3 - TEST A & B] Real Open-Meteo soil moisture extraction & determinism")
    raw_env_mock = {
        "weather": {
            "current": {"temperature_2m": 25.0, "apparent_temperature": 26.2, "relative_humidity_2m": 55, "wind_speed_10m": 10.0},
            "hourly": {
                "temperature_2m": [25.0] * 24,
                "precipitation_probability": [10] * 24,
                "soil_moisture_0_to_1cm": [0.274, 0.275, 0.276],
                "soil_temperature_0cm": [23.5] * 24
            },
            "daily": {"temperature_2m_max": [29.0], "temperature_2m_min": [18.0]}
        }
    }

    # Call persona engine 5 times for the exact same input
    results = [process_persona_insights("agriculture", raw_env_mock, "Test City") for _ in range(5)]
    soil_m_values = [r["metrics"]["soil_moisture"] for r in results]
    
    # 1. Check determinism (Test A)
    assert len(set(soil_m_values)) == 1, f"Soil moisture values were non-deterministic: {soil_m_values}"
    print(f"  -> PASSED (Test A): 5 identical requests yielded identical soil moisture: {soil_m_values[0]}")

    # 2. Check value matches real Open-Meteo input (Test B)
    assert soil_m_values[0] == 0.274, f"Expected 0.274 from Open-Meteo, got {soil_m_values[0]}"
    assert results[0]["detailed_cards"][0]["value"] == "0.274 m³/m³"
    print("  -> PASSED (Test B): Agriculture engine correctly extracted real Open-Meteo value (0.274 m³/m³).")

    # 3. Simulate missing soil moisture data (Test C)
    print("\n[ISSUE #3 - TEST C] Missing soil moisture data handling")
    raw_env_no_soil = {
        "weather": {
            "current": {"temperature_2m": 25.0},
            "hourly": {"temperature_2m": [25.0] * 24, "precipitation_probability": [0] * 24},
            "daily": {}
        }
    }
    insight_no_soil = process_persona_insights("agriculture", raw_env_no_soil, "Test City")
    assert insight_no_soil["metrics"]["soil_moisture"] is None, "Expected None for missing soil moisture"
    assert insight_no_soil["detailed_cards"][0]["value"] == "N/A"
    assert "unavailable" in insight_no_soil["recommendations"][0].lower()
    print("  -> PASSED (Test C): Missing soil moisture returned None/N/A without random fallback.")

    # 4. Check codebase for random soil moisture usage (Test D)
    print("\n[ISSUE #3 - TEST D] Codebase search for random soil moisture generation")
    persona_engine_path = os.path.join(os.path.dirname(__file__), "app", "services", "persona_engine.py")
    with open(persona_engine_path, "r", encoding="utf-8") as f:
        code_content = f.read()

    assert "random.uniform" not in code_content, "Found random.uniform in persona_engine.py!"
    assert "random.random" not in code_content, "Found random.random in persona_engine.py!"
    assert "random.randint" not in code_content, "Found random.randint in persona_engine.py!"
    print("  -> PASSED (Test D): 0 occurrences of random.uniform/random/randint in persona_engine.py.")

    # ── ISSUE #4 TESTS ──────────────────────────────────────────────────────────
    print("\n[ISSUE #4 - TEST A] Request from allowed dev origin (http://localhost:5173)")
    res_allowed = client.options("/api/weather/search", headers={
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    })
    assert res_allowed.headers.get("access-control-allow-origin") == "http://localhost:5173", f"Expected allowed origin header, got: {res_allowed.headers}"
    print("  -> PASSED (Test A): CORS request from http://localhost:5173 succeeded.")

    print("\n[ISSUE #4 - TEST B] Request from unauthorized origin (http://hacker-site.com)")
    res_blocked = client.options("/api/weather/search", headers={
        "Origin": "http://hacker-site.com",
        "Access-Control-Request-Method": "GET"
    })
    allow_origin_header = res_blocked.headers.get("access-control-allow-origin")
    assert allow_origin_header != "http://hacker-site.com" and allow_origin_header != "*", f"Security violation! Unauthorized origin allowed: {allow_origin_header}"
    print("  -> PASSED (Test B): Unauthorized origin http://hacker-site.com blocked by CORS.")

    print("\n[ISSUE #4 - TEST C & D] Backend start check & JWT Auth header over CORS")
    test_token = create_access_token(user_id=1)
    res_jwt = client.get("/api/auth/me", headers={
        "Origin": "http://localhost:5173",
        "Authorization": f"Bearer {test_token}"
    })
    # Will fail user fetch if user 1 doesn't exist, but status should be 401 or 200, not CORS error
    assert res_jwt.headers.get("access-control-allow-origin") == "http://localhost:5173"
    print("  -> PASSED (Test C & D): Backend started cleanly and Bearer token headers supported over CORS.")

    print("\n[ISSUE #4 - TEST E] Verify allow_origins=[\"*\"] is removed from main.py")
    main_py_path = os.path.join(os.path.dirname(__file__), "app", "main.py")
    with open(main_py_path, "r", encoding="utf-8") as f:
        main_code = f.read()

    assert 'allow_origins=["*"]' not in main_code and "allow_origins=['*']" not in main_code, "Wildcard allow_origins=['*'] still present in main.py!"
    print("  -> PASSED (Test E): Wildcard allow_origins=['*'] completely removed from main.py.")

    print("\n" + "=" * 60)
    print("ALL ISSUE #3 & ISSUE #4 TESTS PASSED SUCCESSFULLY! (9/9)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
