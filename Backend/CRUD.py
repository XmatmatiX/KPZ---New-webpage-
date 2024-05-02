import random
import string
from datetime import datetime
from typing import List, Type

from sqlalchemy.orm import Session

import models
import schemas
import exceptions

"""
Create
"""

maximumgroupsize = 6


def create_project_reservation(db: Session,
                               reservation: schemas.ProjectReservationCreate) -> models.ProjectReservation | exceptions.ProjectNotAvailableException:
    """
    Checks if project can be reserved and if yes, creates new project reservation,
    if not returns None
    :param db: Session
    :param reservation: schemas of reservation to be made
    :return: None if project reservation was not possible, otherwise return the reservation
    """
    if can_reserve_project(db, reservation.projectid):
        db_reservation = models.ProjectReservation(projectid=reservation.projectid, groupid=reservation.groupid,
                                                   isconfirmed=False, status="reserved")
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        create_action_history_short(db, db_reservation.projectreservationid, "Zarezerwowano projekt")
        return db_reservation
    raise exceptions.ProjectNotAvailableException


def create_action_history(db: Session, action_history: schemas.ActionHistoryCreate):
    db_action_history = models.ActionHistory(reservationid=action_history.reservationid, datatime=datetime.now(),
                                             content=action_history.content, displayed=False)
    db.add(db_action_history)
    db.commit()
    db.refresh(db_action_history)
    return db_action_history


def create_action_history_short(db: Session, rid: int, contentA: str) -> models.ActionHistory:
    """
    Creates an action history given shorter parametrs
    :param db: Session
    :param rid: id of the reservation
    :param contentA: content of the history (messaged)
    :return: the schemas of made action history
    """
    db_action_history = models.ActionHistory(reservationid=rid, datatime=datetime.now(),
                                             content=contentA, displayed=False)
    db.add(db_action_history)
    db.commit()
    db.refresh(db_action_history)
    return db_action_history


def create_user(db: Session, user: schemas.UserCreate):
    """
    Nie jestem pewna czy to dobry pomysl, zeby zawsze byl liderem przy tworzeniu
    :param db:
    :param user:
    :return:
    """
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


def create_user2(db: Session, user: schemas.UserCreate):
    """
    Creates an user with a role assigned in schemas
    :param db:
    :param user:
    :return:
    """
    db_user = models.Users(name=user.name, surname=user.surname, email=user.email, password=user.password,
                           rolename=user.rolename)  # przepisanie roli
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
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
    """
    This one doesnt requiere a member to be created
    :param db:
    :param group:
    :return:
    """
    if group.invitecode is None:
        group.invitecode = generate_invite_code()
    db_group = models.ProjectGroup(invitecode=group.invitecode, groupsize=0)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

# def create_project_group_with_leader(db: Session, group: schemas.ProjectGroupCreate):
#     if group.invitecode is None:
#         group.invitecode = generate_invite_code()
#     db_group = models.ProjectGroup(invitecode=group.invitecode, groupsize=1)
#     db.add(db_group)
#     db.commit()
#     db.refresh(db_group)

def create_project_group_short(db: Session, user: schemas.UserReturn) -> models.ProjectGroup:
    """
    Creates a group with no parameter needed and generates its invite code as well as sets the size to 0 (1 actually)
    :param db:
    :param user: user creating group <= becomes a leader
    :return: created group
    """
    invite = generate_invite_code()
    db_group = models.ProjectGroup(invitecode=invite, groupsize=0)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    update_user_group_id(db, user, db_group.groupid)
    update_user_role(db, user, "leader")
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


def get_user_by_id(db: Session, id: int):
    db_user = db.query(models.Users).filter(models.Users.userid == id).first()
    return db_user


def get_all_users(db: Session):
    return db.query(models.Users).all()
def get_free_students(db: Session):
    # Pobierz wszystkich użytkowników, którzy nie mają przypisanej grupy
    return db.query(models.Users).filter(models.Users.groupid == None).all()

def get_all_projetcs(db: Session):
    return db.query(models.Project).all()

def get_all_groups(db: Session):
    return db.query(models.ProjectGroup).all()

def get_all_guardians(db: Session):
    return db.query(models.Guardian).all()


def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.projectid == project_id).first()


def get_project_by_company(db: Session, project_name: string):
    return db.query(models.Project).filter(models.Project.companyname == project_name).all()


def get_user_by_surname(db: Session, surname: str):
    return db.query(models.Users).filter(models.Users.surname == surname).all()


def get_project_reservation_by_id(db: Session, project_reservation_id: int) -> models.ProjectReservation | None:
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.projectreservationid == project_reservation_id).first()


def get_project_reservation_by_group(db: Session, group_id: int) -> models.ProjectReservation | None:
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.groupid == group_id).first()


def get_action_history(db: Session, reservation_id: int):
    return db.query(models.ActionHistory).filter(models.ActionHistory.reservationid == reservation_id).all()


def get_action_history_id(db: Session, id: int):
    return db.query(models.ActionHistory).filter(models.ActionHistory.historyid == id).first()


def get_group_by_invite_code(db: Session, invite_code: str):
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.invitecode == invite_code).first()


def get_group(db: Session, groupid: int) -> models.ProjectGroup | None:
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.groupid == groupid).first()


def get_group_members(db: Session, groupid: int) -> list[models.Users] | None:
    return db.query(models.Users).filter(models.Users.groupid == groupid).all()



def get_group_leader(db: Session, groupid: int) -> models.Users | None:
    members = get_group_members(db, groupid)
    for member in members:
        if member.rolename == 'leader':
            return member
    return None


def get_guardian(db: Session, id: int) -> models.Guardian | None:
    return db.query(models.Guardian).filter(models.Guardian.guardianid == id).first()


def get_all_projects(db: Session) -> list[Type[models.Project]]:
    return db.query(models.Project).all()


def get_groups_assigned_to_projects(db: Session, project: models.Project) -> list[int] | None:
    groups = []
    reservations = db.query(models.ProjectReservation).filter(
        models.ProjectReservation.projectid == project.projectid).all()
    for reservation in reservations:
        groups.append(reservation.groupid)
    return groups


"""
Update
"""

# # dodawanie uzytkownika do grupy
# def update_project_group_users(db:Session, user)

def update_user_role(db: Session, user: schemas.UserBase, role: str):
    user.rolename = role
    db.commit()
    db.refresh(user)
    return user


def update_group_group_size(db: Session, gid: int, increase: bool):
    """
    Actualize a group size of a group
    :param db: Session
    :param gid: id of the group
    :param increase: if True then it increases the group size by 1, if false decreses the group size
    :return: --
    raise Exception if the group size would be invalid because if the operation (max group size is for now 6, min is 1)
    """
    group = get_group(db, gid)
    if increase:
        if group.groupsize + 1 > maximumgroupsize:
            raise exceptions.GroupSizeExccededException
        else:
            group.groupsize += 1
    else:
        if group.groupsize == 1:
            raise exceptions.MinimumSizeGroupException
        else:
            group.groupsize -= 1
    db.commit()
    db.refresh(group)


def update_user_group_id(db: Session, user: schemas.UserBase, group: int):
    if not has_group_reservation(db, group):
        if user.rolename == "student":
            if group is None:
                if user.groupid is not None:
                    update_group_group_size(db, user.groupid, False)
                user.groupid = None
                db.commit()
                db.refresh(user)
            elif user.groupid is None:
                user.groupid = group
                update_group_group_size(db, group, True)
                db.commit()
                db.refresh(user)
            elif user.groupid is not group:
                update_group_group_size(db, user.groupid, False)
                user.groupid = group
                update_group_group_size(db, group, True)
                db.commit()
                db.refresh(user)
        elif user.rolename == "leader":
            user_group = get_group(db, user.groupid)
            if user_group.groupsize == 1:
                user.rolename = "student"
                user.groupid = group
                db.commit()
                db.refresh(user)
                delete_group(db, user_group)
            else:
                raise exceptions.LeaderException
    else:
        raise exceptions.GroupWithReservation
    return user


def update_project_group_guardian(db: Session, gid: int, guardian: int):
    group = get_group(db, gid)
    if (group.guardianid is None) or (group.guardianid is not guardian):
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


def update_project_reservation_files(db: Session, reservation: schemas.ProjectReservationBase, path):
    reservation.confirmationpath = path
    reservation.status = "waiting"
    db.commit()
    db.refresh(reservation)
    create_action_history_short(db, reservation.projectreservationid, contentA="Dodano pliki")
    return reservation


def update_project_reservation_isConfirmed(db: Session, reservation: schemas.ProjectReservationBase):
    reservation.isConfirmed = True
    reservation.status = "confirmed"
    db.commit()
    db.refresh(reservation)
    action = schemas.ActionHistoryCreate(
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


def delete_user(db: Session, user: schemas.UserBase):
    if user.rolename == "leader":
        raise exceptions.LeaderException
    db.delete(user)
    db.commit()


def delete_all_users(db: Session):
    db.query(models.Users).filter(models.Users.groupid is not None).delete()
    db.commit()


def delete_project(db: Session, project: schemas.Project):
    try:
        db.delete(project)
        db.commit()
    except:
        db.rollback()
        raise exceptions.AssignedProjectException


def delete_group(db: Session, group: schemas.ProjectGroupReturn):
    """
    Delete a group from database
    :param db: Session
    :param group: group to be deleted
    :return: True if delete was possible - the group hasnt chosen the subject, the group had only one meber who decied to leave
    :return: False if the delete action isnt possible due to project reservation made by the group or due to too many members of the group.
    The group can only be deleted if it has one member only.
    """
    if group.groupsize > 1:
        raise exceptions.DeleteGroupException
    try:
        if group.groupsize == 1:
            db.delete(group)
            db.commit()
    except Exception:
        db.rollback()
        raise exceptions.GroupWithReservation


def delete_project_reservation(db: Session, reservation: schemas.ProjectReservationBase):
    """
    This deletes a reservation as well as all acton history connected to that
    :param db:
    :param reservation:
    :return:
    """
    delete_ALL_action_history(db, reservation.projectreservationid)
    db.delete(reservation)
    db.commit()


def delete_ALL_action_history(db: Session, reservationid: int):
    db.query(models.ActionHistory).filter(models.ActionHistory.reservationid == reservationid).delete()
    db.commit()


def delete_action_history(db: Session, action: schemas.ActionHistoryBase):
    db.delete(action)
    db.commit()


def delete_guardian(db: Session, guardian: schemas.GuardianBase):
    """
    Delete guardian from database
    :param db: Session
    :param guardian: guardian to be deleted
    :return: True if delete was possible, False if delete could not be handled
    If delete can not be handled, chosen guardian is assigned to a group and therefore can not be deleted.
    Delete would be possible if the group changed the guardian or was deleted
    """
    try:
        db.delete(guardian)
        db.commit()
    except:
        db.rollback()
        raise exceptions.GuardianAssignedException


def delete_all(db: Session):
    delete_all_users(db)
    db.query(models.ActionHistory).delete()
    db.query(models.ProjectReservation).delete()
    db.query(models.ProjectGroup).delete()
    db.query(models.Guardian).delete()
    db.query(models.Project).delete()
    db.commit()


"""
Inne potrzebne funkcje
"""


def can_reserve_project(db: Session, pid: int) -> bool:
    """
    Zwraca True jesli liczba rezerwacji projektu zezwala na wykonanie projektu, false jesli zajete sa wszystkie grupy projektowe
    pid  - id projecktu
    """
    return number_project_reserved(db, pid) < (get_project_by_id(db, pid)).groupnumber


def number_project_reserved(db: Session, pid: int) -> int:
    return db.query(models.ProjectReservation).filter(models.ProjectReservation.projectid == pid).count()


def generate_invite_code(size=6, chars=string.ascii_uppercase + string.digits) -> str:
    """
    Do czasu znalezienia lepszego miejsca tutaj daje
    :return: losowe haslo wstepu do grupy
    """
    return ''.join(random.choice(chars) for _ in range(size))


def has_group_reservation(db: Session, gid: int):
    db_query = db.query(models.ProjectReservation).filter(models.ProjectReservation.groupid == gid).first()
    return db_query is not None
