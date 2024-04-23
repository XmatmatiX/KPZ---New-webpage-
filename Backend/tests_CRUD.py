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
    test_name = "Test"
    db = SessionLocal()

    # Wywołanie funkcji get_user2
    user = CRUD.get_user_by_name(db, test_name)

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
    assert created_user.rolename == "leader"


def test_create_guardian_CRUD():
    guardian_data = schemas.GuardianCreate(
        name="Kasia",
        surname="Kowalska",
        email="test@example.com"
    )

    # Optionally, query the database to verify that the user was created
    db = SessionLocal()
    created_guardian = CRUD.create_guardian(db, guardian_data)

    # Check that the user exists in the database
    assert created_guardian is not None

    # Check that the user data matches the expected data
    # Sprawdzenie, czy użytkownik został poprawnie utworzony
    assert created_guardian.name == guardian_data.name
    assert created_guardian.surname == guardian_data.surname
    assert created_guardian.email == guardian_data.email


"""
Coś nie tak
"""


def test_create_group_CRUD():
    group_data = schemas.ProjectGroupCreate(
        guardianid=2,
        name="gr",
        invitecode="1e23",
        groupsize=1
    )
    db = SessionLocal()
    created_group = CRUD.create_project_group(db, group_data)
    assert created_group is not None
    assert created_group.invitecode == group_data.invitecode


def test_get_group_by_invite_code_CRUD():
    invite_code = "1e23"
    db = SessionLocal()
    # Wywołanie funkcji get_group
    group = CRUD.get_group_by_invite_code(db, invite_code)

    # Sprawdzenie, czy grupa zostala prawidlowo stworzona
    assert group is not None
    assert group.invitecode == invite_code


def test_create_project_CRUD():
    project_data = schemas.ProjectCreate(
        companyname="Firma",
        projecttitle="tytuł",
        email="test@example.com",
        phonenumber="123456789",
        description="bardzo dlugo opis testowy zawierający różne znaki",
        mingroupsize=1,
        maxgroupsize=5,
        groupnumber=2,
        englishgroup=False
    )
    db = SessionLocal()
    project = CRUD.create_project(db, project_data)
    assert project is not None
    assert project.companyname == project_data.companyname
    assert project.projecttitle == project_data.projecttitle
    assert project.description == project_data.description
    assert project.mingroupsize == project_data.mingroupsize
    assert project.maxgroupsize == project_data.maxgroupsize
    assert project.groupnumber == project_data.groupnumber
    assert project.englishgroup == project_data.englishgroup


def test_get_project_by_company_CRUD():
    name = "Firma"
    db = SessionLocal()
    # Wywołanie funkcji get_group
    project = CRUD.get_project_by_company(db, name)

    # Sprawdzenie, czy użytkownik o podanym imieniu został poprawnie pobrany
    assert project is not None
    assert len(project) >= 0


def test_update_user_role():
    db = SessionLocal()
    user = CRUD.get_user_by_name(db, "Test")
    changed_user = CRUD.update_user_role(db, user, "leader")
    assert changed_user is not None
    assert changed_user.name == user.name
    assert changed_user.surname == user.surname
    assert changed_user.email == user.email
    assert changed_user.rolename == "leader"
    changed_user = CRUD.update_user_role(db, user, "student")
    assert changed_user is not None
    assert changed_user.name == user.name
    assert changed_user.surname == user.surname
    assert changed_user.email == user.email
    assert changed_user.rolename == "student"
    changed_user = CRUD.update_user_role(db, user, "admin")
    assert changed_user is not None
    assert changed_user.name == user.name
    assert changed_user.surname == user.surname
    assert changed_user.email == user.email
    assert changed_user.rolename == "admin"


def test_update_user_group_id():
    db = SessionLocal()
    user = CRUD.get_user_by_name(db, "John")
    changed_user = CRUD.update_user_group_id(db, user, 1)
    assert changed_user is not None
    assert changed_user.name == user.name
    assert changed_user.surname == user.surname
    assert changed_user.email == user.email
    assert changed_user.groupid == 1


def test_get_group():
    db = SessionLocal()
    group=CRUD.get_group(db, 1)
    assert group is not None
    assert group.groupid == 1

def test_update_project_group_guardian():
    db = SessionLocal()
    group = CRUD.get_group(db, 1)
    guardian=1
    changedgrup=CRUD.update_project_group_guardian(db, group, guardian)
    assert changedgrup is not None
    assert changedgrup.guardianid == guardian


def test_create_project_reservation():
    db = SessionLocal()
    reservation = schemas.ProjectReservationCreate(
        projectid=1,
        groupid=1,
    )
    created_reservation = CRUD.create_project_reservation(db, reservation)
    assert created_reservation is not None
    assert created_reservation.projectid == reservation.projectid
    assert created_reservation.groupid == reservation.groupid