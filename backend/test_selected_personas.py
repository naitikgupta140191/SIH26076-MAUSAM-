"""
Test Suite for Issue #2: selected_personas type mismatch in Mausam API
"""
import sys
import os
import uuid
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models import User
from backend.app.schemas import UserAuthResponse
from backend.app.security import create_access_token

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING SELECTED_PERSONAS TYPE MISMATCH TEST SUITE")
    print("=" * 60)

    # ── TEST A: DB record containing JSON string '["farmer", "traveller"]' -> returned as list ["farmer", "traveller"]
    print("\n[TEST A] Existing DB record with JSON string '[\"farmer\", \"traveller\"]' returned as array")
    db = SessionLocal()
    uid = uuid.uuid4().hex[:6]
    test_user = User(
        name="Legacy User",
        email=f"legacy_{uid}@test.com",
        password_hash="dummyhash",
        primary_persona="farmer",
        selected_personas='["farmer", "traveller", "student"]' # Raw JSON string in DB
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    user_id = test_user.id
    token = create_access_token(user_id=user_id)
    db.close()

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, f"Failed GET /me: {res.text}"
    body = res.json()
    assert isinstance(body["selected_personas"], list), f"Expected list, got {type(body['selected_personas'])}"
    assert body["selected_personas"] == ["farmer", "traveller", "student"], f"Unexpected list content: {body['selected_personas']}"
    print(f"  -> PASSED: DB JSON string converted to native JSON array: {body['selected_personas']}")

    # ── TEST B: Record already containing a list representation
    print("\n[TEST B] Pydantic validator handles native list correctly")
    parsed_auth = UserAuthResponse(
        id=999,
        name="List User",
        email="list@test.com",
        primary_persona="health",
        selected_personas=["health", "fitness"],
        access_token=token
    )
    assert isinstance(parsed_auth.selected_personas, list)
    assert parsed_auth.selected_personas == ["health", "fitness"]
    print("  -> PASSED: Native list representation returned correctly.")

    # ── TEST C: Empty / NULL selected_personas returns [] without error
    print("\n[TEST C] Empty/NULL selected_personas returns [] without API crash")
    res_schema_null = UserAuthResponse(
        id=101, name="Null", email="null@test.com", primary_persona="health", selected_personas=None
    )
    assert res_schema_null.selected_personas == [], f"Expected [], got {res_schema_null.selected_personas}"

    res_schema_empty = UserAuthResponse(
        id=102, name="Empty", email="empty@test.com", primary_persona="health", selected_personas="[]"
    )
    assert res_schema_empty.selected_personas == [], f"Expected [], got {res_schema_empty.selected_personas}"

    db = SessionLocal()
    uid_null = uuid.uuid4().hex[:6]
    empty_str_user = User(
        name="Empty String User",
        email=f"empty_{uid_null}@test.com",
        password_hash="dummyhash",
        primary_persona="health",
        selected_personas="" # empty string in DB
    )
    db.add(empty_str_user)
    db.commit()
    db.refresh(empty_str_user)
    empty_token = create_access_token(user_id=empty_str_user.id)
    db.close()

    res_empty = client.get("/api/auth/me", headers={"Authorization": f"Bearer {empty_token}"})
    assert res_empty.status_code == 200, f"Failed GET /me for empty user: {res_empty.text}"
    body_empty = res_empty.json()
    assert isinstance(body_empty["selected_personas"], list), "Expected list for empty selected_personas"
    assert body_empty["selected_personas"] == [], f"Expected empty list, got {body_empty['selected_personas']}"
    print("  -> PASSED: NULL/empty selected_personas returned [] without crashing API.")


    # ── TEST D: Registering user with array input persists and returns array
    print("\n[TEST D] Registering user with array input returns proper JSON array")
    reg_uid = uuid.uuid4().hex[:6]
    reg_res = client.post("/api/auth/register", json={
        "name": "New User",
        "email": f"new_{reg_uid}@test.com",
        "password": "password123",
        "primary_persona": "agriculture",
        "selected_personas": ["agriculture", "commuter", "event"]
    })
    assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
    reg_body = reg_res.json()
    assert isinstance(reg_body["selected_personas"], list), f"Expected list, got {type(reg_body['selected_personas'])}"
    assert reg_body["selected_personas"] == ["agriculture", "commuter", "event"]
    print(f"  -> PASSED: Registration returned proper array: {reg_body['selected_personas']}")

    # ── TEST E: Refreshing / GET /me restores selected personas array
    print("\n[TEST E] GET /me restores selected personas array")
    me_token = reg_body["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {me_token}"})
    assert me_res.status_code == 200
    me_body = me_res.json()
    assert isinstance(me_body["selected_personas"], list)
    assert me_body["selected_personas"] == ["agriculture", "commuter", "event"]
    print("  -> PASSED: /api/auth/me successfully restored array.")

    # ── TEST F: Verify NO double JSON encoding
    print("\n[TEST F] Verify no double JSON encoding in response payload")
    raw_response_text = me_res.text
    # Check that it contains "selected_personas":["agriculture","commuter","event"]
    # NOT "selected_personas":"[\"agriculture\", ...]"
    assert '"selected_personas":["agriculture"' in raw_response_text or '"selected_personas": [' in raw_response_text, f"Double encoding detected in raw text: {raw_response_text}"
    print("  -> PASSED: No double JSON encoding found in response payload.")

    print("\n" + "=" * 60)
    print("ALL SELECTED_PERSONAS TESTS PASSED SUCCESSFULLY! (6/6)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
