from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from api import main


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    data_dir = tmp_path / "data"
    monkeypatch.setattr(main, "DATA_DIR", data_dir)
    monkeypatch.setattr(main, "DATABASE_PATH", data_dir / "test.sqlite3")
    monkeypatch.setattr(main, "RESUME_DIR", data_dir / "resumes")
    with TestClient(main.app) as test_client:
        yield test_client


def test_example_records_are_created(client: TestClient) -> None:
    companies = client.get("/api/companies").json()
    opportunities = client.get("/api/opportunities").json()

    assert any(company["id"] == "example-employer" for company in companies)
    assert len(opportunities) == 3
    assert all(opportunity["example"] for opportunity in opportunities)


def test_company_role_and_eligibility_rest_workflow(client: TestClient) -> None:
    company_response = client.post(
        "/api/companies",
        json={"name": "Portfolio Demo Company", "website": "https://example.org", "description": "Fictional record"},
    )
    assert company_response.status_code == 201
    company = company_response.json()

    role_response = client.post(
        "/api/opportunities",
        json={
            "company_id": company["id"],
            "role": "QA Intern",
            "location": "Remote",
            "employment_type": "Internship",
            "skills": ["Python", "API testing"],
            "description": "Create repeatable API checks and document defects clearly.",
            "minimum_gpa": 7.0,
            "maximum_backlogs": 0,
        },
    )
    assert role_response.status_code == 201
    role = role_response.json()

    eligible = client.post("/api/eligibility/check", json={"opportunity_id": role["id"], "gpa": 8.0, "active_backlogs": 0})
    ineligible = client.post("/api/eligibility/check", json={"opportunity_id": role["id"], "gpa": 6.5, "active_backlogs": 0})
    assert eligible.json()["status"] == "eligible"
    assert ineligible.json()["status"] == "not_eligible"

    assert client.delete("/api/opportunities/" + role["id"]).status_code == 204
    assert client.delete("/api/companies/" + company["id"]).status_code == 204


def test_company_website_rejects_unsafe_scheme(client: TestClient) -> None:
    response = client.post("/api/companies", json={"name": "Unsafe Site", "website": "javascript:alert(1)"})
    assert response.status_code == 422


def test_resume_submission_is_stored_locally_and_can_be_deleted(client: TestClient) -> None:
    response = client.post(
        "/api/resume-submissions",
        data={
            "opportunity_id": "example-frontend-intern",
            "full_name": "Demo Student",
            "email": "student@example.org",
            "program": "B.Tech Computer Science",
            "graduation_year": "2027",
            "gpa": "8.2",
            "active_backlogs": "0",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.4\nDemo content", "application/pdf")},
    )
    assert response.status_code == 201
    submitted = response.json()
    assert "No employer was contacted" in submitted["message"]

    rows = client.get("/api/applications").json()
    assert len(rows) == 1
    assert rows[0]["resume_name"] == "resume.pdf"
    updated = client.patch("/api/applications/" + submitted["id"] + "/status", json={"status": "Interview"})
    assert updated.status_code == 200
    assert client.get("/api/applications").json()[0]["status"] == "Interview"
    assert client.patch("/api/applications/" + submitted["id"] + "/status", json={"status": "Made up"}).status_code == 422
    stored_files = list(main.RESUME_DIR.glob("*.pdf"))
    assert len(stored_files) == 1

    deleted = client.delete("/api/applications/" + submitted["id"])
    assert deleted.status_code == 204
    assert client.get("/api/applications").json() == []
    assert not stored_files[0].exists()


def test_resume_submission_rejects_ineligible_student(client: TestClient) -> None:
    response = client.post(
        "/api/resume-submissions",
        data={
            "opportunity_id": "example-frontend-intern",
            "full_name": "Demo Student",
            "email": "student@example.org",
            "program": "B.Tech Computer Science",
            "graduation_year": "2027",
            "gpa": "6.0",
            "active_backlogs": "0",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.4\nDemo content", "application/pdf")},
    )
    assert response.status_code == 409
    assert client.get("/api/applications").json() == []
    assert not list(main.RESUME_DIR.glob("*"))


def test_feedback_uses_built_in_checks_without_gemini(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "")
    response = client.post(
        "/api/feedback",
        json={
            "target_role": "Frontend Developer",
            "skills": "React, JavaScript",
            "summary": "Built a course project using React and JavaScript to create a responsive product page.",
            "consent_to_ai": False,
        },
    )
    assert response.status_code == 200
    assert response.json()["source"] == "local_checks"
    assert response.json()["focus_areas"]


def test_public_demo_exposes_sample_routes_and_blocks_coordinator_records(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(main, "PUBLIC_DEMO", True)

    assert client.get("/api/status").json()["public_demo"] is True
    companies = client.get("/api/companies")
    opportunities = client.get("/api/opportunities")
    assert companies.status_code == 200
    assert [company["id"] for company in companies.json()] == ["example-employer"]
    assert opportunities.status_code == 200
    assert all(opportunity["example"] for opportunity in opportunities.json())
    assert client.get("/api/applications").status_code == 403
    assert client.post("/api/companies", json={"name": "Public Demo Company"}).status_code == 403

    blocked_submission = client.post(
        "/api/resume-submissions",
        data={
            "opportunity_id": "example-frontend-intern",
            "full_name": "Demo Student",
            "email": "student@example.org",
            "program": "B.Tech Computer Science",
            "graduation_year": "2027",
        },
        files={"resume": ("resume.pdf", b"%PDF-1.4\nDemo content", "application/pdf")},
    )
    assert blocked_submission.status_code == 403

    eligibility = client.post(
        "/api/eligibility/check",
        json={"opportunity_id": "example-frontend-intern", "gpa": 8.2, "active_backlogs": 0},
    )
    assert eligibility.status_code == 200
    assert eligibility.json()["status"] == "eligible"
