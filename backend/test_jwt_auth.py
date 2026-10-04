"""
Test Suite for Issue #1: JWT Authentication & IDOR Prevention in Mausam API
"""
import sys
import os
import json
from datetime import timedelta
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.security import create_access_token

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING JWT AUTHENTICATION TEST SUITE")
    print("=" * 60)
    
    # 0. Clean test user emails if exist or generate unique
    import uuid
    uid = uuid.uuid4().hex[:6]
    user_a_email = f"user_a_{uid}@test.com"
    user_b_email = f"user_b_{uid}@test.com"
    password = "password123"

    print("\n[SETUP] Registering User A and User B...")
    res_a = client.post("/api/auth/register", json={
        "name": "User Alpha",
        "email": user_a_email,
        "password": password,
        "primary_persona": "health",
        "selected_personas": ["health", "fitness"]
    })
    assert res_a.status_code == 200, f"User A registration failed: {res_a.text}"
    user_a_data = res_a.json()
    assert "access_token" in user_a_data and user_a_data["access_token"], "User A missing access_token"
    token_a = user_a_data["access_token"]
    user_a_id = user_a_data["id"]
    print(f"  User A created (ID: {user_a_id}) with valid JWT.")

    res_b = client.post("/api/auth/register", json={
        "name": "User Beta",
        "email": user_b_email,
        "password": password,
        "primary_persona": "agriculture",
        "selected_personas": ["agriculture"]
    })
    assert res_b.status_code == 200, f"User B registration failed: {res_b.text}"
    user_b_data = res_b.json()
    assert "access_token" in user_b_data and user_b_data["access_token"], "User B missing access_token"
    token_b = user_b_data["access_token"]
    user_b_id = user_b_data["id"]
    print(f"  User B created (ID: {user_b_id}) with valid JWT.")

    # ── TEST A: Login with valid credentials → JWT returned → authenticated API request succeeds
    print("\n[TEST A] Login with valid credentials -> returns JWT -> authenticated request succeeds")
    login_res = client.post("/api/auth/login", json={
        "email": user_a_email,
        "password": password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    assert "access_token" in login_data and login_data["access_token"], "No access_token returned on login"
    login_token = login_data["access_token"]
    
    # Use token to access protected /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login_token}"})
    assert me_res.status_code == 200, f"Protected /api/auth/me failed: {me_res.text}"
    assert me_res.json()["email"] == user_a_email, "Profile email mismatch"
    print("  -> PASSED: Valid credentials login gave JWT; protected endpoint returned 200 OK.")

    # ── TEST B: Request a protected endpoint without JWT → HTTP 401
    print("\n[TEST B] Request a protected endpoint without JWT -> HTTP 401")
    no_jwt_res = client.get("/api/user/saved-locations")
    assert no_jwt_res.status_code == 401, f"Expected 401, got {no_jwt_res.status_code}"
    
    no_jwt_pref = client.get("/api/user/preferences")
    assert no_jwt_pref.status_code == 401, f"Expected 401, got {no_jwt_pref.status_code}"
    
    no_jwt_alerts = client.get("/api/alerts")
    assert no_jwt_alerts.status_code == 401, f"Expected 401, got {no_jwt_alerts.status_code}"
    print("  -> PASSED: All protected endpoints returned HTTP 401 when Authorization header is missing.")

    # ── TEST C: Request with invalid JWT → HTTP 401
    print("\n[TEST C] Request with invalid JWT -> HTTP 401")
    invalid_jwt_res = client.get("/api/user/saved-locations", headers={"Authorization": "Bearer invalid.fake.token"})
    assert invalid_jwt_res.status_code == 401, f"Expected 401, got {invalid_jwt_res.status_code}"
    print("  -> PASSED: Invalid JWT returned HTTP 401.")

    # ── TEST D: Request with expired JWT → HTTP 401
    print("\n[TEST D] Request with expired JWT -> HTTP 401")
    expired_token = create_access_token(user_id=user_a_id, expires_delta=timedelta(seconds=-10))
    expired_res = client.get("/api/user/saved-locations", headers={"Authorization": f"Bearer {expired_token}"})
    assert expired_res.status_code == 401, f"Expected 401, got {expired_res.status_code}"
    assert "expired" in expired_res.json()["detail"].lower(), f"Unexpected detail: {expired_res.json()}"
    print(f"  -> PASSED: Expired JWT returned HTTP 401 with message '{expired_res.json()['detail']}'.")

    # ── TEST E: IDOR Test: User A cannot see or delete User B's data
    print("\n[TEST E] IDOR Prevention: User A cannot access or manipulate User B's private data")
    # User B creates a private saved location and an alert
    loc_b_res = client.post("/api/user/saved-locations", json={
        "name": "Secret Location User B",
        "country": "India",
        "latitude": 19.07,
        "longitude": 72.87
    }, headers={"Authorization": f"Bearer {token_b}"})
    assert loc_b_res.status_code == 200, f"User B save location failed: {loc_b_res.text}"
    loc_b_id = loc_b_res.json()["id"]

    alert_b_res = client.post("/api/alerts", json={
        "location_name": "Mumbai",
        "latitude": 19.07,
        "longitude": 72.87,
        "persona": "beach",
        "metric": "Wave Height",
        "threshold_value": 2.5,
        "condition": "gt",
        "alert_message": "User B Secret Alert"
    }, headers={"Authorization": f"Bearer {token_b}"})
    assert alert_b_res.status_code == 200, f"User B create alert failed: {alert_b_res.text}"
    alert_b_id = alert_b_res.json()["id"]

    # User A requests saved locations: MUST NOT see User B's location
    loc_a_res = client.get("/api/user/saved-locations", headers={"Authorization": f"Bearer {token_a}"})
    user_a_locations = [loc["name"] for loc in loc_a_res.json()]
    assert "Secret Location User B" not in user_a_locations, "IDOR VULNERABILITY: User A saw User B's location!"

    # User A requests alerts: MUST NOT see User B's alert
    alerts_a_res = client.get("/api/alerts", headers={"Authorization": f"Bearer {token_a}"})
    user_a_alerts = [al["alert_message"] for al in alerts_a_res.json()]
    assert "User B Secret Alert" not in user_a_alerts, "IDOR VULNERABILITY: User A saw User B's alert!"

    # User A attempts to DELETE User B's location
    del_loc_res = client.delete(f"/api/user/saved-locations/{loc_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert del_loc_res.status_code == 404, f"IDOR VULNERABILITY: User A deleted User B's location! Got {del_loc_res.status_code}"

    # User A attempts to DELETE User B's alert
    del_alert_res = client.delete(f"/api/alerts/{alert_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert del_alert_res.status_code == 404, f"IDOR VULNERABILITY: User A deleted User B's alert! Got {del_alert_res.status_code}"
    print("  -> PASSED: IDOR completely blocked. User A cannot view or delete User B's private data.")

    # ── TEST F: User A accesses their own data → succeeds
    print("\n[TEST F] User A accesses their own data -> succeeds")
    # User A creates a saved location
    loc_a_create = client.post("/api/user/saved-locations", json={
        "name": "User A Personal City",
        "country": "India",
        "latitude": 28.61,
        "longitude": 77.20
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert loc_a_create.status_code == 200, f"User A create location failed: {loc_a_create.text}"
    loc_a_id = loc_a_create.json()["id"]

    # User A fetches own locations
    loc_a_get = client.get("/api/user/saved-locations", headers={"Authorization": f"Bearer {token_a}"})
    assert any(l["id"] == loc_a_id for l in loc_a_get.json()), "User A cannot see their own saved location"

    # User A updates own preferences
    pref_update = client.put("/api/user/preferences", json={
        "default_persona": "fitness",
        "temp_unit": "F",
        "theme": "dark",
        "notifications_enabled": True
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert pref_update.status_code == 200, f"User A update pref failed: {pref_update.text}"
    assert pref_update.json()["default_persona"] == "fitness"

    # User B checks preferences: must NOT be affected by User A
    pref_b = client.get("/api/user/preferences", headers={"Authorization": f"Bearer {token_b}"})
    assert pref_b.status_code == 200
    assert pref_b.json()["default_persona"] == "agriculture", "User B preference was overwritten by User A!"

    # User A deletes their own location
    del_own_res = client.delete(f"/api/user/saved-locations/{loc_a_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert del_own_res.status_code == 200, f"User A delete own location failed: {del_own_res.text}"
    print("  -> PASSED: User A successfully managed their own locations, preferences, and alerts.")

    # ── Public Endpoints Check (Backward compatibility)
    print("\n[CHECK] Public endpoints remain accessible without auth")
    pub_root = client.get("/")
    assert pub_root.status_code == 200
    pub_search = client.get("/api/weather/search?q=Delhi")
    assert pub_search.status_code == 200
    pub_dash = client.get("/api/weather/persona-dashboard?lat=28.61&lon=77.20&persona=health&city=Delhi")
    assert pub_dash.status_code == 200
    print("  -> PASSED: Public weather endpoints remain completely accessible.")

    print("\n" + "=" * 60)
    print("ALL JWT & SECURITY TESTS PASSED SUCCESSFULLY! (6/6)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
