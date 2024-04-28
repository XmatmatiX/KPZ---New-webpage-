from jose import jwt
from sqlalchemy import create_engine, false
from sqlalchemy.orm import sessionmaker
from sqlalchemy.testing import db
from starlette.testclient import TestClient
import random
import time

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from Backend import CRUD, schemas
from Backend.main import app, get_db, create_access_token, get_user

SQLALCHEMY_DATABASE_URL = "postgresql://testuser:testpassword@localhost/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_registration():
    # Define test user data
    user_data = {
        "name": "Test",
        "surname": "User",
        "email": "test@example.com",
        "password": "password123",
        "rolename": "user"
    }

    # Send a POST request to the /register/ endpoint with the user data
    response = client.post("/register/", json=user_data)

    # Check if the response status code is 201 Created
    assert response.status_code == 201

    # Check if the response body contains the expected message
    assert response.json() == {"message": "user created successfully"}
def test_login():
    # Create a test client
    client = TestClient(app)

    # Define test data for creating a user
    form_data ={
        "email": "test@example.com",
        "password": "password123"
    }
    # Convert the UserCreate object to a dictionary
    # user_data_dict = user_data.dict()

    # Send a POST request to the /login/ endpoint with the JSON data
    response = client.post("/login/", json=form_data)

    # Sprawdzenie, czy odpowiedź ma status kod 200 OK
    assert response.status_code == 200

    # Sprawdzenie, czy odpowiedź zawiera token dostępu
    # assert "access_token" in response.json()
    # assert response.json()["token_type"] == "bearer"
    #
    # # Sprawdzenie, czy token dostępu jest poprawny i nie wygasł
    # access_token = response.json()["access_token"]
    # decoded_token = jwt.decode(access_token, verify=False)
    # assert "sub" in decoded_token
    # assert "scopes" in decoded_token
    # assert decoded_token["sub"] == "test_user"
    # assert decoded_token["scopes"] == ["user"]

    # Sprawdzenie, czy token dostępu wygasa po odpowiednim czasie
    # token_expires_at = datetime.fromtimestamp(decoded_token["exp"])
    # assert token_expires_at > datetime.utcnow() + timedelta(minutes=15)
