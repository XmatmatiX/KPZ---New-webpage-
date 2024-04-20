import string
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session
import models
import schemas

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


def create_project_reservation(db: Session, project_id: int, group_id: int):
    db_obj = models.ProjectReservation(ProjectID=project_id, GroupID=group_id, IsConfirmed=False, Status="reserved")
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def create_action_history(db: Session, reservation_id: int, content_history: string):
    db_action_history = models.ActionHistory(ReservationID=reservation_id, DataTime=datetime.now(),
                                             Content=content_history, Displayed=False)
    db.add(db_action_history)
    db.commit()
    db.refresh(db_action_history)
    return db_action_history


def create_user(db: Session, name: str, surname: str, email: str, password: str):
    db_user = models.User(Name=name, Surname=surname,
                          Email=email, Password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

"""
Create user, ale w wersji jak w crudzie zaki z zeszlego semetru
"""
def create_user2(db: Session, user: schemas.UserCreate):
    db_user = models.User(Name=user.Name, Surname=user.Surname, Email=user.Email, Password=user.Password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)


def create_guardian(db: Session, name: str, surname: str, email: str):
    db_guardian = models.Guardian(Name=name, Surname=surname,
                                  Email=email)
    db.add(db_guardian)
    db.commit()
    db.refresh(db_guardian)
    return db_guardian


def create_project(db: Session, company_name: str, project_title: str, email: str, phone_number,
                   project_description: str, logo_path: str, technologies: str, min_group_size: int, max_group_size: int,
                   group_number: int, english_group: bool, remarks, cooperation_type: str):
    db_project = models.Project(CompanyName=company_name, ProjectTitle=project_title, Description=project_description,
                                Email=email, PhoneNumber=phone_number, LogoPath=logo_path, Technologies=technologies,
                                MinGroupSize=min_group_size, MaxGroupSize=max_group_size, GroupNumber=group_number,
                                EnglishGroup=english_group, Remarks=remarks, CooperationType=cooperation_type
                                )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

"""
Read
"""

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
