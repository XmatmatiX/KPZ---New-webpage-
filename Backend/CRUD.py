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
    db_reservation = models.ProjectReservation(projectid=reservation.projectid, groupid=reservation.groupid, isconfirmed=False, status="reserved")
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
    db_user = models.Users(name=user.name, surname=user.surname, email=user.email,password= user.password, rolename=("leader")) # przy tworzeniu user jest liderem
    # Dodawanie użytkownika do sesji
    db.add(db_user)

    # Zatwierdzanie zmian w sesji
    db.commit()

    # Odświeżenie obiektu, aby zawierał najnowsze dane z bazy (opcjonalne)
    db.refresh(db_user)

    # Zwrócenie nowo dodanego użytkownika
    return db_user



def create_guardian(db: Session, guardian:schemas.GuardianCreate):
    db_guardian = models.Guardian(name=guardian.name,surname=guardian.surname, email=guardian.email)
    db.add(db_guardian)
    db.commit()
    db.refresh(db_guardian)
    return db_guardian


def create_project(db: Session, project:schemas.ProjectCreate):
    db_project = models.Project(companyname=project.companyname, projecttitle=project.projecttitle, description=project.description,
                                email=project.email, phonenumber=project.phonenumber, logopath=project.logopath, technologies=project.technologies,
                                mingroupsize=project.mingroupsize, maxgroupsize=project.maxgroupsize, groupnumber=project.groupnumber,
                                englishgroup=project.englishgroup, remarks=project.remarks, cooperationtype=project.cooperationtype
                                )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


"""
Read
"""

def get_user_by_name(db: Session, name:str):
    db_user = db.query(models.Users).filter(models.Users.name ==name).first()
    return db_user

def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.ProjectID == project_id).first()


def get_project_by_company(db: Session, project_name: string):
    return db.query(models.Project).filter(models.Project.CompanyName == project_name).all()


def get_user_by_surname(db: Session, surname: str):
    return db.query(models.User).filter(models.User.Surname == surname).all()


def get_project_reservation_by_id(db: Session, project_reservation_id: int) -> models.ProjectReservation | None:
    query_search = select(models.ProjectReservation).where(
        models.ProjectReservation.ProjectID == project_reservation_id)
    project_reservation = db.execute(query_search).first()
    return project_reservation


def get_project_reservation_by_group(db: Session, group_id: int):
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.GroupID == group_id).first()

def get_action_history(db:Session, reservation_id:int):
    return db.query(models.ActionHistory).filter(models.ActionHistory.ReservationID==reservation_id).all()




"""
Update
"""


"""
Delete
"""
