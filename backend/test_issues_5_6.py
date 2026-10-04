"""
Test Suite for Issue #5 (User-Scoped Saved Locations) & Issue #6 (Remove Hardcoded default_user)
"""
import sys
import os
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING TEST SUITE FOR ISSUE #5 & ISSUE #6")
    print("=" * 60)

    # ── SETUP USER A & USER B ──────────────────────────────────────────────────
    uid_a = uuid.uuid4().hex[:6]
    uid_b = uuid.uuid4().hex[:6]

    res_a = client.post("/api/auth/register", json={
        "name": "User A",
        "email": f"usera_{uid_a}@test.com",
        "password": "password123",
        "primary_persona": "health"
    })
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    user_a_id = res_a.json()["id"]

    res_b = client.post("/api/auth/register", json={
        "name": "User B",
        "email": f"userb_{uid_b}@test.com",
        "password": "password123",
        "primary_persona": "fitness"
    })
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    user_b_id = res_b.json()["id"]

    print(f"[SETUP] Created User A (ID: {user_a_id}) and User B (ID: {user_b_id})")

    # ── TEST 1 & 3: User A updates and requests preferences ────────────────────
    print("\n[TEST 1 & 3] User A updates preferences and fetches them")
    update_a = client.put("/api/user/preferences", json={
        "default_persona": "traveler",
        "temp_unit": "F",
        "theme": "light",
        "notifications_enabled": False
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert update_a.status_code == 200
    assert update_a.json()["default_persona"] == "traveler"
    assert update_a.json()["temp_unit"] == "F"

    get_pref_a = client.get("/api/user/preferences", headers={"Authorization": f"Bearer {token_a}"})
    assert get_pref_a.status_code == 200
    assert get_pref_a.json()["user_id"] == str(user_a_id)
    assert get_pref_a.json()["default_persona"] == "traveler"
    print("  -> PASSED: User A preferences created and updated correctly for User A's ID.")

    # ── TEST 2 & 4: User B updates preferences -> User A's remain unchanged ────
    print("\n[TEST 2 & 4] User B updates preferences -> User A's preferences remain unchanged")
    update_b = client.put("/api/user/preferences", json={
        "default_persona": "agriculture",
        "temp_unit": "C",
        "theme": "dark",
        "notifications_enabled": True
    }, headers={"Authorization": f"Bearer {token_b}"})
    assert update_b.status_code == 200
    assert update_b.json()["default_persona"] == "agriculture"

    # Check User A's preferences again
    get_pref_a_again = client.get("/api/user/preferences", headers={"Authorization": f"Bearer {token_a}"})
    assert get_pref_a_again.json()["default_persona"] == "traveler", "User A preference was mutated by User B!"
    assert get_pref_a_again.json()["temp_unit"] == "F"
    print("  -> PASSED: User B preference update did not affect User A.")

    # ── TEST 5 & 7: User A creates saved location ─────────────────────────────
    print("\n[TEST 5 & 7] User A creates a saved location and fetches locations")
    loc_a = client.post("/api/user/saved-locations", json={
        "name": "New Delhi - User A",
        "country": "India",
        "latitude": 28.61,
        "longitude": 77.20
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert loc_a.status_code == 200
    loc_a_id = loc_a.json()["id"]

    get_locs_a = client.get("/api/user/saved-locations", headers={"Authorization": f"Bearer {token_a}"})
    assert len(get_locs_a.json()) >= 1
    assert any(l["id"] == loc_a_id for l in get_locs_a.json())
    print("  -> PASSED: Location automatically associated with User A.")

    # ── TEST 6 & 8: User B creates saved location ─────────────────────────────
    print("\n[TEST 6 & 8] User B creates a saved location and fetches locations")
    loc_b = client.post("/api/user/saved-locations", json={
        "name": "Mumbai - User B",
        "country": "India",
        "latitude": 19.07,
        "longitude": 72.87
    }, headers={"Authorization": f"Bearer {token_b}"})
    assert loc_b.status_code == 200
    loc_b_id = loc_b.json()["id"]

    get_locs_b = client.get("/api/user/saved-locations", headers={"Authorization": f"Bearer {token_b}"})
    assert any(l["id"] == loc_b_id for l in get_locs_b.json())
    assert not any(l["id"] == loc_a_id for l in get_locs_b.json()), "User B saw User A's saved location!"
    print("  -> PASSED: Location automatically associated with User B; User B sees only their locations.")

    # ── TEST 9: User A attempts to access / update / delete User B's location ──
    print("\n[TEST 9] IDOR test: User A attempts to GET/PUT/DELETE User B's saved location")
    # GET User B location by ID
    get_b_by_a = client.get(f"/api/user/saved-locations/{loc_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert get_b_by_a.status_code in [404, 403], f"Expected 404/403, got {get_b_by_a.status_code}"

    # PUT User B location by ID
    put_b_by_a = client.put(f"/api/user/saved-locations/{loc_b_id}", json={
        "name": "Hacked Location",
        "country": "Hacked",
        "latitude": 0.0,
        "longitude": 0.0
    }, headers={"Authorization": f"Bearer {token_a}"})
    assert put_b_by_a.status_code in [404, 403], f"Expected 404/403, got {put_b_by_a.status_code}"

    # DELETE User B location by ID
    del_b_by_a = client.delete(f"/api/user/saved-locations/{loc_b_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert del_b_by_a.status_code in [404, 403], f"Expected 404/403, got {del_b_by_a.status_code}"
    print("  -> PASSED: User A cannot read, update, or delete User B's saved location.")

    # ── TEST 10: Codebase search for 'default_user' ────────────────────────────
    print("\n[TEST 10] Codebase search to ensure 'default_user' logic is removed")
    backend_dir = os.path.join(os.path.dirname(__file__), "app")
    matches = []
    for root, _, files in os.walk(backend_dir):
        for fname in files:
            if fname.endswith(".py"):
                fpath = os.path.join(root, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "default_user" in content:
                        matches.append(fpath)

    assert len(matches) == 0, f"Found hardcoded 'default_user' in files: {matches}"
    print("  -> PASSED: 0 instances of 'default_user' found in active backend code.")

    print("\n" + "=" * 60)
    print("ALL ISSUE #5 & ISSUE #6 TESTS PASSED SUCCESSFULLY! (10/10)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
