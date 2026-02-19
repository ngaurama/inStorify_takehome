# ./test_todos.pyu
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db


# in memory sqlite db
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    # just create tables
    Base.metadata.create_all(bind=engine)
    yield
    # and drop the tables
    Base.metadata.drop_all(bind=engine)


def test_create_todo_success():
    """Test to check a todo is successfully created"""
    response = client.post("/api/todos", json={
        "title": "Buy groceries",
        "priority": "medium"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["completed"] is False
    assert data["priority"] == "medium"
    assert "id" in data
    assert "created_at" in data


def test_get_nonexistent_todo():
    """Test to check thar getting a non-existent todo returns 404"""
    response = client.get("/api/todos/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_todo_no_title():
    """Test to check that creating a todo without a title returns an error"""
    response = client.post("/api/todos", json={})
    assert response.status_code == 422
    error_detail = response.json()["detail"][0]
    assert "title" in error_detail["loc"]


def test_create_todo_invalid_priority():
    """Test to check validation of priority types"""
    response = client.post("/api/todos", json={
        "title": "Buy milk",
        "priority": "urgent"
    })
    assert response.status_code == 422


def test_create_todo_title_too_long():
    """Test to check that a title too long return an error"""
    long_title = "a" * 201
    response = client.post("/api/todos", json={
        "title": long_title
    })
    assert response.status_code == 422


def test_update_todo_title():
    """Test that checks if updating an item works"""
    create = client.post("/api/todos", json={"title": "Old Title"})
    todo_id = create.json()["id"]

    update = client.put(f"/api/todos/{todo_id}", json={
        "title": "New Title"
    })

    assert update.status_code == 200
    assert update.json()["title"] == "New Title"


def test_update_nonexistent_todo():
    """test to check if updating non-existent todo return an error"""
    response = client.put("/api/todos/9999", json={
        "title": "Doesn't matter"
    })
    assert response.status_code == 404


def test_delete_todo():
    """Test to check that deletion of an todo item works"""
    create = client.post("/api/todos", json={"title": "To delete"})
    todo_id = create.json()["id"]

    delete = client.delete(f"/api/todos/{todo_id}")
    assert delete.status_code == 204

    get_again = client.get(f"/api/todos/{todo_id}")
    assert get_again.status_code == 404


def test_stats_endpoint():
    """Test to check if all stats are properly counted"""
    client.post("/api/todos", json={"title": "Low", "priority": "low"})
    client.post("/api/todos", json={"title": "Medium", "priority": "medium"})
    client.post("/api/todos", json={"title": "High", "priority": "high"})
    client.post("/api/todos", json={"title": "Done", "priority": "high",
                                    "completed": True})

    response = client.get("/api/todos/stats")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] == 4
    assert data["completed"] == 1
    assert data["pending"] == 3
    assert data["priority"]["low"] == 1
    assert data["priority"]["medium"] == 1
    assert data["priority"]["high"] == 2


def test_delete_nonexistent_todo():
    """Test to check that deleting a non-existent todo return an error"""
    response = client.delete("/api/todos/12345")
    assert response.status_code == 404


def test_get_todos_filtering():
    """Test that filtering todos works"""
    client.post("/api/todos", json={
            "title": "Buy milk",
            "priority": "low",
            "completed": False
        }
    )
    client.post("/api/todos", json={
            "title": "Buy eggs",
            "priority": "high",
            "completed": False
        }
    )
    client.post("/api/todos", json={
            "title": "Walk dog",
            "priority": "medium",
            "completed": True
        }
    )

    # filter by not completed
    response = client.get("/api/todos?completed=false")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(not todo["completed"] for todo in data)

    # filter by completed
    response = client.get("/api/todos?completed=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Walk dog"

    # filter by priority
    response = client.get("/api/todos?priority=high")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Buy eggs"

    # search by title
    response = client.get("/api/todos?search=buy")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all("buy" in todo["title"].lower() for todo in data)

    # combine pending + low priority
    response = client.get("/api/todos?completed=false&priority=low")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Buy milk"
