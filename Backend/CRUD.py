import string
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session
import models, schemas

"""
Wyszukiwanie:
projektu po id, po nazwie firmy
rezerwacji po id rezerwacji, po grupie, liderze
studenta po nazwisku
actionHistory po id rezerwacji

Tworzenie:
actionHistory,
ProjectReservation, 
uzytkownika (2 wersje), 
guardian, 
project

"""

"""
Create
"""


def create_project_reservation(db: Session, reservation: schemas.ProjectReservationCreate):
    db_reservation = models.ProjectReservation(projectid=reservation.projectid, groupid=reservation.groupid,
                                               isconfirmed=False, status="reserved")
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def create_action_history(db: Session, action_history: schemas.ActionHistoryCreate):
    db_action_history = models.ActionHistory(reservationid=action_history.reservationid, datatime=datetime.now(),
                                             content=action_history.content, displayed=False)
    db.add(db_action_history)
    db.commit()
    db.refresh(db_action_history)
    return db_action_history


def create_user(db: Session, user: schemas.UserCreate):
    # Tworzenie obiektu użytkownika na podstawie danych z argumentu user
    db_user = models.Users(name=user.name, surname=user.surname, email=user.email, password=user.password,
                           rolename=("leader"))  # przy tworzeniu user jest liderem
    # Dodawanie użytkownika do sesji
    db.add(db_user)

    # Zatwierdzanie zmian w sesji
    db.commit()

    # Odświeżenie obiektu, aby zawierał najnowsze dane z bazy (opcjonalne)
    db.refresh(db_user)

    # Zwrócenie nowo dodanego użytkownika
    return db_user


def create_guardian(db: Session, guardian: schemas.GuardianCreate):
    db_guardian = models.Guardian(name=guardian.name, surname=guardian.surname, email=guardian.email)
    db.add(db_guardian)
    db.commit()
    db.refresh(db_guardian)
    return db_guardian


def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(companyname=project.companyname, projecttitle=project.projecttitle,
                                description=project.description,
                                email=project.email, phonenumber=project.phonenumber, logopath=project.logopath,
                                technologies=project.technologies,
                                mingroupsize=project.mingroupsize, maxgroupsize=project.maxgroupsize,
                                groupnumber=project.groupnumber,
                                englishgroup=project.englishgroup, remarks=project.remarks,
                                cooperationtype=project.cooperationtype
                                )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


"""
W momencie tworzenia grupy, jej wielkosc (groupsize) to 1 - w grupie jest tylko lider
"""


def create_project_group(db: Session, group: schemas.ProjectGroupCreate):
    db_group = models.ProjectGroup(invitecode=group.invitecode, groupsize=1)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


"""
Read
"""

"""
Tutaj jest jeden a w get by surname jest all ? Możemy dac w obu tak samo?
"""
def get_user_by_name(db: Session, name: str):
    db_user = db.query(models.Users).filter(models.Users.name == name).first()
    return db_user


def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.projectid == project_id).first()


def get_project_by_company(db: Session, project_name: string):
    return db.query(models.Project).filter(models.Project.companyname == project_name).all()


def get_user_by_surname(db: Session, surname: str):
    return db.query(models.Users).filter(models.Users.surname == surname).all()


def get_project_reservation_by_id(db: Session, project_reservation_id: int) -> models.ProjectReservation | None:
    return db.query(models.ProjectReservation).filter(models.ProjectReservation.projectreservationid == project_reservation_id).first()


def get_project_reservation_by_group(db: Session, group_id: int):
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.groupid == group_id).first()


def get_action_history(db: Session, reservation_id: int):
    return db.query(models.ActionHistory).filter(models.ActionHistory.reservationid == reservation_id).all()


def get_group_by_invite_code(db: Session, invite_code: str):
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.invitecode == invite_code).first()

def get_group(db:Session, groupid: int):
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.groupid == groupid).first()


def get_group_members(db:Session, groupid: int):
    return db.query(models.Users).filter(models.Users.groupid == groupid).all()

def get_group_leader(db:Session, groupid: int):
    members = get_group_members(db, groupid)
    for member in members:
        if member.rolename == 'leader':
            return member
    return None

"""
Update
"""


def update_user_role(db: Session, user: schemas.UserBase, role: str):
    user.rolename = role
    db.commit()
    db.refresh(user)
    return user

def update_user_group_id(db: Session, user: schemas.UserBase, group: int):
    user.groupid = group
    db.commit()
    db.refresh(user)
    return user

def update_project_group_guardian(db: Session, group: schemas.ProjectGroupBase, guardian: int):
    group.guardianid = guardian
    db.commit()
    db.refresh(group)
    return group

def update_action_history_displayed(db: Session, history: schemas.ActionHistoryBase):
    history.displayed = True
    db.commit()
    db.refresh(history)
    return history
"""
Jesli doda sie pliki to rezerwacja ma status waiting na konfirmacje admina (?) 
Dodanie pliku tworzy rowniez actionhistory o tym
"""
def update_project_reservation_files(db: Session, reservation:schemas.ProjectReservationBase, path):
    reservation.confirmationpath = path
    reservation.status = "waiting"
    db.commit()
    db.refresh(reservation)
    action=schemas.ActionHistoryCreate(
        reservationid=reservation.projectreservationid,
        content='Dodano pliki',
        datatime='13.04.2012',
        displayed=False
    )
    create_action_history(db, action)
    return reservation

def update_project_reservation_isConfirmed(db: Session, reservation:schemas.ProjectReservationBase):
    reservation.isConfirmed = True
    reservation.status = "Confirmed"
    db.commit()
    db.refresh(reservation)
    action=schemas.ActionHistoryCreate(
        reservationid=reservation.projectreservationid,
        content='Zatwierdzono',
        datatime='13.04.2012',
        displayed=False
    )
    create_action_history(db, action)
    return reservation

"""
Delete
"""
