from sqlalchemy import create_engine, false
from sqlalchemy.orm import sessionmaker
from sqlalchemy.testing import db
from starlette.testclient import TestClient
import random
import time

from fastapi.testclient import TestClient
from database import SessionLocal
from Backend import CRUD, models, schemas

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



def test_get_user_CRUD():
    test_name = "John"
    db = SessionLocal()

    # Wywołanie funkcji get_user2
    user = CRUD.get_user(db, test_name)

    # Sprawdzenie, czy użytkownik o podanym imieniu został poprawnie pobrany
    assert user is not None
    assert user.name == test_name

def test_create_user_CRUD():
    user_data = schemas.UserCreate(
        name="Test",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )

    # Optionally, query the database to verify that the user was created
    db = SessionLocal()
    created_user = CRUD.create_user(db, user_data)

    # Check that the user exists in the database
    assert created_user is not None

    # Check that the user data matches the expected data
    # Sprawdzenie, czy użytkownik został poprawnie utworzony
    assert created_user.name == user_data.name
    assert created_user.surname == user_data.surname
    assert created_user.email == user_data.email
    assert created_user.rolename == user_data.rolename
