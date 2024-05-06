import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from Backend import CRUD, models, schemas
from database import SessionLocal
import exceptions

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Kpz2024@localhost:5432/kpz_database"

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


def test_create_project_group_CRUD():
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


def test_create_group_CRUD2():
    db = SessionLocal()
    created_group = CRUD.create_project_group_short(db)
    assert created_group is not None
    assert created_group.groupsize == 1


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
    groupId = 1
    group = CRUD.get_group(db, groupId)
    assert group is not None
    assert group.groupid == groupId


def test_update_project_group_guardian():
    db = SessionLocal()
    group = CRUD.get_group(db, 1)
    guardian = 1
    changedgrup = CRUD.update_project_group_guardian(db, group, guardian)
    assert changedgrup is not None
    assert changedgrup.guardianid == guardian


def test_create_project_reservation():
    db = SessionLocal()
    reservation = schemas.ProjectReservationCreate(
        projectid=2,
        groupid=10,
    )
    created_reservation = CRUD.create_project_reservation(db, reservation)
    assert created_reservation is not None
    assert created_reservation.projectid == reservation.projectid
    assert created_reservation.groupid == reservation.groupid


def test_create_action_history():
    db = SessionLocal()
    action_history = schemas.ActionHistoryCreate(
        reservationid=3,
        content='Dokonano rezerwacji',
        datatime='13.04.2012',
        displayed=False
    )
    createdHistory = CRUD.create_action_history(db, action_history)
    assert createdHistory is not None
    assert createdHistory.reservationid == action_history.reservationid
    assert createdHistory.content == action_history.content


def test_get_project_by_id():
    id = 1
    db = SessionLocal()
    project = CRUD.get_project_by_id(db, id)
    assert project is not None
    assert project.projectid == id


def test_get_user_by_surname():
    db = SessionLocal()
    surname = 'User'
    user = CRUD.get_user_by_surname(db, surname)[0]
    assert user is not None
    assert user.surname == surname


def test_get_project_reservation_by_id():
    db = SessionLocal()
    resId = 1
    reservation = CRUD.get_project_reservation_by_id(db, resId)
    assert reservation is not None
    assert reservation.projectreservationid == resId


def test_get_project_reservation_by_group():
    db = SessionLocal()
    group = 1
    reservation = CRUD.get_project_reservation_by_group(db, group)
    assert reservation is not None
    assert reservation.projectreservationid == group


def test_get_action_history():
    db = SessionLocal()
    reservation = 1
    action_history = CRUD.get_action_history(db, reservation)
    assert action_history is not None
    assert len(action_history) >= 1
    assert action_history[0].reservationid == reservation


def test_update_action_history_displayed():
    db = SessionLocal()
    rid = 1
    history = CRUD.get_action_history(db, rid)[0]
    updated_history = CRUD.update_action_history_displayed(db, history)
    assert updated_history is not None
    assert updated_history.reservationid == history.reservationid
    assert updated_history.content == history.content
    assert updated_history.displayed == True
    assert updated_history.historyid == history.historyid
    assert updated_history.datatime == history.datatime


def test_update_project_reservation_files():
    db = SessionLocal()
    path = "plik.pdf"
    pid = 1
    reservation = CRUD.get_project_reservation_by_id(db, pid)
    history = CRUD.get_action_history(db, pid)
    updated_reservation = CRUD.update_project_reservation_files(db, reservation, path)
    assert updated_reservation is not None
    assert updated_reservation.projectid == reservation.projectid
    assert updated_reservation.groupid == reservation.groupid
    assert updated_reservation.confirmationpath == path
    assert updated_reservation.projectreservationid == reservation.projectreservationid
    assert updated_reservation.projectreservationid == pid

    history2 = CRUD.get_action_history(db, pid)

    assert len(history) + 1 == len(history2)
    newaction = [x for x in history2 if x not in history]
    assert newaction is not None
    assert newaction[0].content == 'Dodano pliki'
    assert newaction[0].displayed == False
    assert newaction[0].reservationid == pid


def test_update_project_reservation_isConfirmed():
    db = SessionLocal()
    pid = 1
    reservation = CRUD.get_project_reservation_by_id(db, pid)
    history = CRUD.get_action_history(db, pid)
    updated_reservation = CRUD.update_project_reservation_isConfirmed(db, reservation)
    assert updated_reservation is not None
    assert updated_reservation.projectid == reservation.projectid
    assert updated_reservation.groupid == reservation.groupid
    assert updated_reservation.isConfirmed == True
    assert updated_reservation.projectreservationid == reservation.projectreservationid
    assert updated_reservation.projectreservationid == pid

    history2 = CRUD.get_action_history(db, pid)

    assert len(history) + 1 == len(history2)
    newaction = [x for x in history2 if x not in history]
    assert newaction is not None
    assert newaction[0].content == 'Zatwierdzono'
    assert newaction[0].displayed == False
    assert newaction[0].reservationid == pid


def test_get_group_members():
    db = SessionLocal()
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    user2 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    user3 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    group_data = schemas.ProjectGroupCreate(
        guardianid=2,
        name="gr",
        invitecode="1e23",
        groupsize=1
    )

    user1 = CRUD.create_user(db, user1)
    user2 = CRUD.create_user(db, user2)
    user3 = CRUD.create_user(db, user3)
    user1 = CRUD.update_user_role(db, user1, 'leader')
    user2 = CRUD.update_user_role(db, user2, 'student')
    user3 = CRUD.update_user_role(db, user3, 'student')
    group = CRUD.create_project_group(db, group_data)

    CRUD.update_user_group_id(db, user1, group.groupid)
    CRUD.update_user_group_id(db, user2, group.groupid)
    CRUD.update_user_group_id(db, user3, group.groupid)
    team = CRUD.get_group_members(db, group.groupid)

    assert team is not None
    assert len(team) == 3


def test_get_group_leader():
    db = SessionLocal()
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    user2 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    user3 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="sss"
    )
    group_data = schemas.ProjectGroupCreate(
        guardianid=2,
        name="gr",
        invitecode="1e23",
        groupsize=1
    )

    user1 = CRUD.create_user(db, user1)
    user2 = CRUD.create_user(db, user2)
    user3 = CRUD.create_user(db, user3)
    user1 = CRUD.update_user_role(db, user1, 'leader')
    user2 = CRUD.update_user_role(db, user2, 'student')
    user3 = CRUD.update_user_role(db, user3, 'student')
    group = CRUD.create_project_group(db, group_data)

    CRUD.update_user_group_id(db, user1, group.groupid)
    CRUD.update_user_group_id(db, user2, group.groupid)
    CRUD.update_user_group_id(db, user3, group.groupid)

    leader = CRUD.get_group_leader(db, group.groupid)
    assert leader is not None
    assert leader.name == user1.name
    assert leader.surname == user1.surname
    assert leader.email == user1.email


def test_get_user_by_id():
    db = SessionLocal()
    id = 1
    user = CRUD.get_user_by_id(db, id)
    assert user is not None
    assert user.userid == id


def test_delete_user():
    db = SessionLocal()
    id = 1
    user = CRUD.get_user_by_id(db, id)
    CRUD.delete_user(db, user)
    user_delete = CRUD.get_user_by_id(db, id)
    assert user_delete is None


def test_delete_all_users():
    db = SessionLocal()
    CRUD.delete_all_users(db)
    users = db.query(models.Users).all()
    assert len(users) == 0


def test_delete_project():
    db = SessionLocal()
    id = 1
    project = CRUD.get_project_by_id(db, id)
    if CRUD.delete_project(db, project):
        project_delete = CRUD.get_project_by_id(db, id)
        assert project_delete is None


def test_delete_group():
    db = SessionLocal()
    id = 2
    group = CRUD.get_group(db, id)
    if CRUD.delete_group(db, group):
        group_delete = CRUD.get_group(db, id)
        assert group_delete is None


def test_delete_ALL_action_history():
    db = SessionLocal()
    rid = 1
    CRUD.delete_ALL_action_history(db, rid)
    history = CRUD.get_action_history(db, rid)
    assert len(history) == 0


def test_delete_project_reservation():
    db = SessionLocal()
    rid = 1
    project_reservation = CRUD.get_project_reservation_by_id(db, rid)
    CRUD.delete_project_reservation(db, project_reservation)
    project_reservation_2 = CRUD.get_project_reservation_by_id(db, rid)
    assert project_reservation_2 is None


def test_delete_action_history():
    db = SessionLocal()
    id = 13
    history = CRUD.get_action_history_id(db, id)
    CRUD.delete_action_history(db, history)
    action_history = CRUD.get_action_history_id(db, id)
    assert action_history is None


def test_get_action_history_id():
    db = SessionLocal()
    id = 12
    history = CRUD.get_action_history_id(db, id)
    assert history is not None
    assert history.historyid == id


def test_get_guardian():
    db = SessionLocal()
    id = 1
    guard = CRUD.get_guardian(db, id)
    assert guard is not None
    assert guard.guardianid == id


def test_delete_guardian():
    db = SessionLocal()
    id = 1
    guard = CRUD.get_guardian(db, id)
    CRUD.delete_guardian(db, guard)
    guard_delete = CRUD.get_guardian(db, id)
    assert guard_delete is None


def test_delete_all():
    db = SessionLocal()
    CRUD.delete_all(db)
    assert len(db.query(models.Guardian).all()) == 0
    assert len(db.query(models.Users).all()) == 0
    assert len(db.query(models.ProjectReservation).all()) == 0
    assert len(db.query(models.ActionHistory).all()) == 0
    assert len(db.query(models.ProjectGroup).all()) == 0
    assert len(db.query(models.Project).all()) == 0


def test_number_project_reserved():
    db = SessionLocal()
    pid = 2
    num = CRUD.number_project_reserved(db, pid)
    assert num == 1


def test_can_reserve_project():
    db = SessionLocal()
    pid = 2
    assert CRUD.can_reserve_project(db, pid)


def test_group_functionality():
    db = SessionLocal()
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="student"
    )
    user2 = schemas.UserCreate(
        name="user2",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="student"
    )
    user3 = schemas.UserCreate(
        name="user3",
        surname="User",
        email="test@example.com",
        password="password123",
        rolename="student"
    )

    guardian = schemas.GuardianCreate(
        name="Guardian",
        surname="Guardianowicz",
        email="guardian.guardianowicz@pwr.edu.pl",
    )
    """
    Tworzenie studentow i grupy
    """
    user1 = CRUD.create_user2(db, user1)
    user2 = CRUD.create_user2(db, user2)
    user3 = CRUD.create_user2(db, user3)
    group = CRUD.create_project_group_short(db, user2)
    guardian = CRUD.create_guardian(db, guardian)

    assert group is not None

    CRUD.update_user_group_id(db, user1, group.groupid)
    CRUD.update_user_group_id(db, user3, group.groupid)
    CRUD.update_project_group_guardian(db, group.groupid, guardian.guardianid)

    assert group.guardianid == guardian.guardianid
    assert group.groupsize == 3
    CRUD.update_user_group_id(db, user1, None)
    assert group.groupsize == 2
    assert user1.groupid != group.groupid
    assert (CRUD.get_group_leader(db, group.groupid)).userid == user2.userid
    with pytest.raises(Exception) as exception_info:
        CRUD.update_user_group_id(db, user2, group.groupid)
    assert exception_info.type == exceptions.LeaderException
    with pytest.raises(Exception) as exception_info:
        CRUD.delete_group(db, group)
    assert exception_info.type == exceptions.DeleteGroupException

    user2 = CRUD.update_user_role(db, user2, "student")
    user3 = CRUD.update_user_role(db, user3, "leader")
    leader = CRUD.get_group_leader(db, group.groupid)
    assert leader is not user2
    assert leader == user3
    CRUD.update_user_group_id(db, user2, None)

    assert group.groupsize == 1
    gid=group.groupid
    CRUD.update_user_group_id(db, user3, None)
    group=CRUD.get_group(db, gid)
    assert group is None

def test_has_group_reservation():
    db = SessionLocal()
    gid=10
    assert CRUD.has_group_reservation(db, gid)

