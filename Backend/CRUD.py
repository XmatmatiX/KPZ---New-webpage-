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

Tworzenie:
actionHistory,
ProjectReservation

W klasie grupa trzeba dodać lidera?
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


def get_project_reservation_by_leader(db: Session, leader_id: int):
    group = db.query(models.Group).filter(models.Group.Leader == leader_id).first()
    return get_project_reservation_by_group(db, group)


"""
Update
"""

def update_user_in_group(db:Session, db_user:models.User, group_id: int):
    db_user.GroupID = group_id
    db_user.sqlmodel_update()

"""
Delete
"""
