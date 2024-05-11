import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from Backend import CRUD, models, schemas
from database import SessionLocal
import exceptions

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def test_user_CRUD():
    user_data = schemas.UserCreate(
        name="Test",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    db = SessionLocal()
    """
    test create_user
    """
    created_user = CRUD.create_user(db, user_data)
    # Check that the user exists in the database
    assert created_user is not None
    # Check that the user data matches the expected data
    assert created_user.name == user_data.name
    assert created_user.surname == user_data.surname
    assert created_user.email == user_data.email
    assert created_user.rolename == "student"

    """
    test get_user_by_id
    """
    user_get = CRUD.get_user_by_id(db, created_user.userid)
    assert user_get is not None
    assert user_get.name == created_user.name
    assert user_get.surname == created_user.surname
    assert user_get.email == created_user.email
    assert user_get.rolename == created_user.rolename

    """
    test get_user_by_name
    """
    users_with_name = CRUD.get_user_by_name(db, user_data.name)
    assert users_with_name is not None
    assert user_get in users_with_name

    """
    test get_user_by_surname
    """
    users_with_surname = CRUD.get_user_by_surname(db, user_data.surname)
    assert users_with_surname is not None
    assert user_get in users_with_surname

    """
    test get_user_by_email
    """
    user_with_mail = CRUD.get_user_by_email(db, user_data.email)
    assert user_with_mail is not None
    assert user_with_mail.name == user_data.name
    assert user_with_mail.surname == user_data.surname
    assert user_with_mail.email == user_data.email
    assert user_with_mail.rolename == user_data.rolename
    assert user_with_mail.userid == created_user.userid

    """
    test create_project_group_short - user becomes leader of newly created project group
    """
    group = CRUD.create_project_group_short(db, created_user)
    assert group is not None
    assert created_user.groupid == group.groupid
    assert created_user.rolename == "leader"
    members = CRUD.get_group_members(db, group.groupid)
    assert members is not None
    assert group.groupsize == 1
    assert created_user in members

    """
    User is leader of a group which only has one member, so if he changes the group, his current group gets deleted
    """
    changed_user = CRUD.update_user_group_id(db, created_user, None)
    assert changed_user is not None
    assert changed_user.rolename == "student"
    assert changed_user.groupid is None
    group = CRUD.get_group(db, group.groupid)
    assert group is None

    """
    test delete_user
    """
    CRUD.delete_user(db, created_user)
    user = CRUD.get_user_by_id(db, created_user.userid)
    assert user is None




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
    CRUD.delete_guardian(db, created_guardian)


def test_project_CRUD():
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
    """
    test create
    """
    project = CRUD.create_project(db, project_data)
    assert project is not None
    assert project.companyname == project_data.companyname
    assert project.projecttitle == project_data.projecttitle
    assert project.description == project_data.description
    assert project.mingroupsize == project_data.mingroupsize
    assert project.maxgroupsize == project_data.maxgroupsize
    assert project.groupnumber == project_data.groupnumber
    assert project.englishgroup == project_data.englishgroup
    """
    test read (get)
    """
    project_get = CRUD.get_project_by_id(db, project.projectid)
    assert are_projects_the_same(project, project_get)

    project_get_by_company_list = CRUD.get_project_by_company(db, project_data.companyname)
    assert project_get_by_company_list is not None
    assert len(project_get_by_company_list) >= 1
    assert project in project_get_by_company_list

    """
    test delete
    """
    CRUD.delete_project(db, project)
    project_get = CRUD.get_project_by_id(db, project.projectid)
    assert project_get is None


def are_projects_the_same(project1: models.Project, project2: models.Project):
    same = (project1 == project2)
    return same


def test_update_user_role():
    db = SessionLocal()
    user_data = schemas.UserCreate(
        name="Test",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user = CRUD.create_user(db, user_data)
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
    CRUD.delete_user(db, user)
    assert (CRUD.get_user_by_id(db, changed_user.userid)) is None


def test_update_user_group_id():
    db = SessionLocal()
    user_data = schemas.UserCreate(
        name="Test",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    group_data = schemas.ProjectGroupCreate()
    user = CRUD.create_user(db, user_data)
    group = CRUD.create_project_group(db, group_data)
    changed_user = CRUD.update_user_group_id(db, user, group.groupid)
    assert changed_user is not None
    assert changed_user.name == user.name
    assert changed_user.surname == user.surname
    assert changed_user.email == user.email
    assert changed_user.groupid == group.groupid
    CRUD.delete_user(db, user)

    assert CRUD.get_user_by_id(db, user.userid) is None
    assert CRUD.get_group(db, group.groupid) is None


def test_project_reservation_CRUD():
    db = SessionLocal()
    project_data = schemas.ProjectCreate(
        companyname="Firma",
        projecttitle="tytuł",
        email="test@example.com",
        phonenumber="123456789",
        description="bardzo dlugo opis testowy zawierający różne znaki",
        mingroupsize=3,
        maxgroupsize=5,
        groupnumber=2,
        englishgroup=False
    )
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user2 = schemas.UserCreate(
        name="user2",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user3 = schemas.UserCreate(
        name="user3",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user4 = schemas.UserCreate(
        name="user4",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user5 = schemas.UserCreate(
        name="user5",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )

    """
    Tworzenie studentow i grupy
    """
    user1 = CRUD.create_user(db, user1)
    user2 = CRUD.create_user(db, user2)
    user3 = CRUD.create_user(db, user3)
    user4 = CRUD.create_user(db, user4)
    user5 = CRUD.create_user(db, user5)
    group = CRUD.create_project_group_short(db, user2)
    CRUD.update_user_group_id(db, user1, group.groupid)
    CRUD.update_user_group_id(db, user3, group.groupid)
    """
    test create
    """
    project = CRUD.create_project(db, project_data)
    group = CRUD.get_group(db, group.groupid)

    created_reservation = CRUD.create_project_reservation(db, project, group)
    assert created_reservation is not None
    assert created_reservation.projectid == project.projectid
    assert created_reservation.groupid == group.groupid
    """
    Creating reservation should create a proper action history
    """
    action_history = CRUD.get_action_history(db, created_reservation.groupid)
    assert action_history is not None
    assert len(action_history) >= 1
    history = action_history[0]
    assert history.groupid == created_reservation.groupid
    assert history.content == "Zarezerwowano projekt"

    updated_history = CRUD.update_action_history_displayed(db, history)
    assert updated_history is not None
    assert updated_history.groupid == history.groupid
    assert updated_history.content == history.content
    assert updated_history.displayed
    assert updated_history.historyid == history.historyid
    assert updated_history.datatime == history.datatime

    """
    If project has reservation, the squad of a group cant cange
    """
    with pytest.raises(Exception) as exception_info:
        user1 = CRUD.update_user_group_id(db, user1, None)
    assert exception_info.type == exceptions.GroupWithReservation
    with pytest.raises(Exception) as exception_info:
        user4 = CRUD.update_user_group_id(db, user4, group.groupid)
    assert exception_info.type == exceptions.GroupWithReservation

    """
    Project reservation get
    """
    reservation = CRUD.get_project_reservation_by_id(db, created_reservation.projectreservationid)
    assert reservation is not None
    assert reservation.projectreservationid == created_reservation.projectreservationid
    assert reservation == created_reservation
    assert CRUD.number_project_reserved(db, project.projectid) == 1
    assert CRUD.is_project_available(db, project.projectid)
    assert CRUD.has_group_reservation(db, group.groupid)

    reservation = CRUD.get_project_reservation_by_group(db, group.groupid)
    assert reservation is not None
    assert reservation.projectreservationid == created_reservation.projectreservationid
    assert reservation == created_reservation
    assert CRUD.number_project_reserved(db, project.projectid) == 1
    assert CRUD.is_project_available(db, project.projectid)
    assert CRUD.has_group_reservation(db, group.groupid)

    path = "plik.pdf"

    updated_reservation = CRUD.update_project_reservation_files(db, reservation, path)
    assert updated_reservation is not None
    assert updated_reservation.projectid == reservation.projectid
    assert updated_reservation.groupid == reservation.groupid
    assert updated_reservation.confirmationpath == path
    assert updated_reservation.projectreservationid == reservation.projectreservationid

    history2 = CRUD.get_action_history(db, updated_reservation.groupid)

    assert len(action_history) + 1 == len(history2)
    newaction = [x for x in history2 if x not in action_history]
    assert newaction is not None
    assert newaction[0].content == 'Dodano pliki'
    assert not newaction[0].displayed
    assert newaction[0].groupid == updated_reservation.groupid

    updated_reservation = CRUD.update_project_reservation_isConfirmed(db, reservation)
    assert updated_reservation is not None
    assert updated_reservation.projectid == reservation.projectid
    assert updated_reservation.groupid == reservation.groupid
    assert updated_reservation.isConfirmed
    assert updated_reservation.projectreservationid == reservation.projectreservationid

    history3 = CRUD.get_action_history(db, updated_reservation.groupid)

    assert len(history2) + 1 == len(history3)
    newaction = [x for x in history3 if x not in history2]
    assert newaction is not None
    assert newaction[0].content == 'Zatwierdzono'
    assert not newaction[0].displayed
    assert newaction[0].groupid == updated_reservation.groupid

    group2 = CRUD.create_project_group_short(db, user4)
    CRUD.update_user_group_id(db, user5, group2.groupid)

    with pytest.raises(Exception) as exception_info:
        CRUD.create_project_reservation(db, project, group2)
    assert exception_info.type == exceptions.GroupSizeNotValidForProjectException
    reservation = CRUD.get_project_reservation_by_group(db, group2.groupid)
    assert reservation is None

    """
    delete reservation - deletes whole action history
    """
    CRUD.delete_project_reservation(db, created_reservation)
    assert CRUD.get_project_reservation_by_id(db, created_reservation.projectreservationid) is None
    assert len(CRUD.get_action_history(db, created_reservation.groupid)) != 0
    user1 = CRUD.update_user_group_id(db, user1, None)
    group = CRUD.get_group(db, group.groupid)
    with pytest.raises(Exception) as exception_info:
        reservation = CRUD.create_project_reservation(db, project, group)
    assert exception_info.type == exceptions.GroupSizeNotValidForProjectException

    CRUD.delete_project(db, project)
    CRUD.delete_user(db, user1)
    CRUD.delete_user(db, user3)
    CRUD.delete_user(db, user2)
    CRUD.delete_user(db, user5)
    CRUD.delete_user(db, user4)







def test_get_group_members_and_leader():
    db = SessionLocal()
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="sss"
    )
    user2 = schemas.UserCreate(
        name="user2",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="sss"
    )
    user3 = schemas.UserCreate(
        name="user3",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="sss"
    )

    user1 = CRUD.create_user(db, user1)
    user2 = CRUD.create_user(db, user2)
    user3 = CRUD.create_user(db, user3)
    user1 = CRUD.update_user_role(db, user1, 'student')
    user2 = CRUD.update_user_role(db, user2, 'student')
    user3 = CRUD.update_user_role(db, user3, 'student')
    group = CRUD.create_project_group_short(db,  user1)

    CRUD.update_user_group_id(db, user2, group.groupid)
    CRUD.update_user_group_id(db, user3, group.groupid)
    team = CRUD.get_group_members(db, group.groupid)

    assert team is not None
    assert len(team) == 3

    leader = CRUD.get_group_leader(db, group.groupid)
    assert leader is not None
    assert leader.name == user1.name
    assert leader.surname == user1.surname
    assert leader.email == user1.email
    assert leader == CRUD.get_user_by_id(db, user1.userid)

    CRUD.delete_group_admin(db, group)
    user1 = CRUD.get_user_by_id(db, user1.userid)
    user2 = CRUD.get_user_by_id(db, user2.userid)
    user3 = CRUD.get_user_by_id(db, user3.userid)
    CRUD.delete_user(db, user1)
    CRUD.delete_user(db, user2)
    CRUD.delete_user(db, user3)





def test_delete_all_users():
    db = SessionLocal()
    CRUD.delete_all_users(db)
    users = db.query(models.Users).all()
    assert len(users) == 0





def test_delete_all():
    db = SessionLocal()
    CRUD.delete_all(db)
    assert len(db.query(models.Guardian).all()) == 0
    assert len(db.query(models.Users).all()) == 0
    assert len(db.query(models.ProjectReservation).all()) == 0
    assert len(db.query(models.ActionHistory).all()) == 0
    assert len(db.query(models.ProjectGroup).all()) == 0
    assert len(db.query(models.Project).all()) == 0


def test_group_functionality():
    db = SessionLocal()
    user1 = schemas.UserCreate(
        name="user1",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user2 = schemas.UserCreate(
        name="user2",
        surname="User",
        email="test@example.com",
        # password="password123",
        rolename="student"
    )
    user3 = schemas.UserCreate(
        name="user3",
        surname="User",
        email="test@example.com",
        # password="password123",
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
    user1 = CRUD.create_user(db, user1)
    user2 = CRUD.create_user(db, user2)
    user3 = CRUD.create_user(db, user3)
    group = CRUD.create_project_group_short(db, user2)
    guardian = CRUD.create_guardian(db, guardian)

    assert group is not None
    group_inv = CRUD.get_group_by_invite_code(db, group.invitecode)
    assert group_inv is not None
    assert group_inv.invitecode == group.invitecode
    assert group_inv.groupsize == group.groupsize
    assert group_inv.groupid == group.groupid

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
    gid = group.groupid
    CRUD.update_user_group_id(db, user3, None)
    group = CRUD.get_group(db, gid)
    assert group is None


