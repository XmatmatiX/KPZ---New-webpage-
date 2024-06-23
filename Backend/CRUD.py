import random
import string
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from sqlalchemy.orm import Session
import pandas as pd
from openpyxl import load_workbook
from fastapi import UploadFile, HTTPException
# from magic import Magic
from datetime import datetime
import models
import schemas
import exceptions
import re

"""
Create
"""

maximumgroupsize = 6

"""
Statusy rezerwacji: "reserved"  -zarezerwowano
 "waiting" - wyslano pliki
"confirmed" - potwierdzono
"""


def create_project_reservation(db: Session, project: models.Project,
                               group: models.ProjectGroup) -> models.ProjectReservation | exceptions.ProjectNotAvailableException:
    """
    Checks if project can be reserved and if yes, checks if group's size is adecuate for this project creates new project reservation,
    if not returns None
    :param db: Session
    :param reservation: schemas of reservation to be made
    :return: return the reservation
    :raise exceptions.ProjectNotAvailableException : if project cannot be reserved - all the group projects were taken
    """
    if isTimeValid():
        if is_project_available(db, project.projectid):
            if is_size_valid(project, group):
                db_reservation = models.ProjectReservation(projectid=project.projectid, groupid=group.groupid,
                                                           status="reserved")
                db.add(db_reservation)
                db.commit()
                db.refresh(db_reservation)
                create_action_history(db, group.groupid,
                                      f"Zarezerwowano projekt: {project.projecttitle} (firma: {project.companyname})")
                return db_reservation
            raise exceptions.GroupSizeNotValidForProjectException
        raise exceptions.ProjectNotAvailableException
    raise exceptions.NotTimeForReservationException





def create_action_history(db: Session, gid: int, contentA: str) -> models.ActionHistory:
    """
    Creates an action history given shorter parametrs
    :param db: Session
    :param rid: id of the group
    :param contentA: content of the history (messaged)
    :return: the schemas of made action history
    """
    db_action_history = models.ActionHistory(groupid=gid, datatime=datetime.now(),
                                             content=contentA, displayed=False)
    db.add(db_action_history)
    db.commit()
    db.refresh(db_action_history)
    return db_action_history


def create_user(db: Session, user: schemas.UserCreate) -> models.Users:
    """
    Creates an user with a role 'student'
    :param db:
    :param user:
    :return:
    """
    db_user = models.Users(name=user.name, surname=user.surname, email=user.email,
                           rolename=user.rolename,
                           keycloackid=user.keycloackid)  # przepisanie roli ZAWSZE JEST STUDENTEM
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_guardian(db: Session, guardian: schemas.GuardianCreate):
    """
    Creates guardian if one doesnt yet exist (based on email)
    or returns one guardian with such email
    """
    guard = get_guardian_byEmail(db, guardian.email)
    if guard is None:
        db_guardian = models.Guardian(name=guardian.name, surname=guardian.surname, email=guardian.email)
        db.add(db_guardian)
        db.commit()
        db.refresh(db_guardian)
        return db_guardian
    return guard


def create_project(db: Session, project: schemas.ProjectCreate):
    # Walidacja pól
    if not project.companyname or not project.projecttitle or not project.email or not project.phonenumber or not project.description or project.mingroupsize is None or project.maxgroupsize is None or project.groupnumber is None or not project.englishgroup:
        raise HTTPException(status_code=400, detail="Wszytskie pola są wymagane")

    try:
        db_project = models.Project(companyname=project.companyname, projecttitle=project.projecttitle,
                                    description=project.description,
                                    email=project.email, phonenumber=project.phonenumber, logopath=project.logopath,
                                    technologies=project.technologies,
                                    mingroupsize=project.mingroupsize, maxgroupsize=project.maxgroupsize,
                                    groupnumber=project.groupnumber,
                                    englishgroup=project.englishgroup, remarks=project.remarks,
                                    cooperationtype=project.cooperationtype, person=project.person
                                    )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Podczas dodawania tematu wystąpił błąd. Projekt nie został utworzony")



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


def create_project_group_short(db: Session, user: schemas.UserReturn) -> models.ProjectGroup:
    """
    Creates a group with no parameter needed and generates its invite code as well as sets the size to 2
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


def create_project_from_forms(db: Session, file_path:str):
    """
    Sciagniecie rekordow z pliku excel wygenerowanego z google forms
    """

    created_projects = []

    try:
        # Wczytaj plik Excel
        wb = load_workbook(file_path)
        sheet = wb.active

        # Wybierz dane z pliku Excel przy użyciu pandas
        # df = pd.read_excel(file_path)

        # Iteracja przez wiersze w DataFrame
        # for index, row in df.iterrows():
        for cell_e, cell_f, cell_b, cell_d, cell_g, cell_h, cell_i, cell_j, cell_k, cell_l, cell_m, cell_c in \
                zip(sheet['E'][1:], sheet['F'][1:], sheet['B'][1:],
                    sheet['D'][1:], sheet['G'][1:], sheet['H'][1:], sheet['I'][1:], sheet['J'][1:], sheet['K'][1:],
                    sheet['L'][1:], sheet['M'][1:], sheet['C'][1:]):
            project = schemas.ProjectCreate(
                companyname=str(cell_e.value),
                projecttitle=str(cell_f.value),
                email=str(cell_b.value),
                phonenumber=str(cell_d.value),
                description=str(cell_g.value),
                cooperationtype=str(cell_h.value),
                mingroupsize=(cell_i.value),
                maxgroupsize=(cell_j.value),
                groupnumber=(cell_k.value),
                englishgroup=str(cell_l.value),
                remarks=str(cell_m.value),
                person=str(cell_c.value)

            )
            created = create_project(db, project)
            print(f"Creating project: {project}")
            created_projects.append(created)
        return created_projects
    except Exception as e:
        # Złapanie i obsługa błędów
        print(f"An error occurred: {str(e)}")


"""
Read
"""

"""
Tutaj jest jeden a w get by surname jest all ? Możemy dac w obu tak samo?
"""


def get_user_by_name(db: Session, name: str):
    db_user = db.query(models.Users).filter(models.Users.name == name).all()
    return db_user


def get_user_by_something(db: Session, text: str) -> list[models.Users] | None:
    """
    Return user whose name, surname or email contains that something
    """
    members = []
    array = getNumbers(text)
    if len(array) > 0:
        for a in array:
            group = get_group(db, a)
            if group:
                memb = get_group_members(db, a)
                for user in memb:
                    members.append(user)

    match = db.query(models.Users).filter(models.Users.name.icontains(text), models.Users.rolename != "admin").all()
    match2 = db.query(models.Users).filter(models.Users.surname.icontains(text), models.Users.rolename != "admin").all()
    match3 = db.query(models.Users).filter(models.Users.email.icontains(text), models.Users.rolename != "admin").all()
    match4 = db.query(models.Users).filter((models.Users.name+models.Users.surname).icontains(text),  models.Users.rolename != "admin").all()
    #result = match + match2 + match3 + match4 + members
    result = list(set(match) | set(match2) | set(match3) | set(match4) | set(members))
    result.sort(key=lambda x: x.surname)
    return result


def get_user_by_id(db: Session, id: int):
    db_user = db.query(models.Users).filter(models.Users.userid == id).first()
    return db_user


def get_user_by_surname(db: Session, surname: str):
    users = db.query(models.Users).filter(models.Users.surname == surname).all()
    users.sort(key=lambda x: x.name)
    return users


def get_user_by_email(db: Session, email: str) -> models.Users | None:
    return db.query(models.Users).filter(models.Users.email == email).first()


def get_free_students(db):
    users = db.query(models.Users).filter(models.Users.groupid == None, models.Users.rolename != "admin").all()
    users.sort(key=lambda x: x.surname)
    return users


def get_group_without_project(db):
    reservations=get_all_reservations(db)
    groups = db.query(models.ProjectGroup).all()
    for reservation in reservations:
        group = get_group(db, reservation.groupid)
        groups.remove(group)
    return get_groups_info(db,groups)

def get_all_students(db):
    return db.query(models.Users).filter(models.Users.rolename != "admin").all()


def get_admins(db):
    return db.query(models.Users).filter(models.Users.rolename == "admin").all()


def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.projectid == project_id).first()

def get_project_by_company(db: Session, project_name: str) -> list[models.Project] | None:
    return db.query(models.Project).filter(models.Project.companyname == project_name).all()


def get_all_projects(db):
    return db.query(models.Project).all()


def get_groups_assigned_to_projects(db, project):
    """
    Returns list of groupid realising the project
    """
    reservations = db.query(models.ProjectReservation).filter(
        models.ProjectReservation.projectid == project.projectid).all()
    groups = []
    for reservation in reservations:
        groups.append(reservation.groupid)
    return groups


def get_project_reservation_by_id(db: Session, project_reservation_id: int) -> schemas.ProjectReservationReturn | None:
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.projectreservationid == project_reservation_id).first()
def get_project_reservation_by_projecttitle(db: Session, projecttitle: str) -> models.ProjectReservation | None:
    return db.query(models.ProjectReservation).join(models.Project).filter(
        models.Project.projecttitle == projecttitle).first()

def get_project_reservation_by_group(db: Session, group_id: int) -> models.ProjectReservation | None:
    return db.query(models.ProjectReservation).filter(
        models.ProjectReservation.groupid == group_id).first()


def get_project_reservation_by_project(db: Session, pid: int) -> list[models.ProjectReservation] | None:
    return db.query(models.ProjectReservation).filter(models.ProjectReservation.projectid == pid).all()


def get_all_reservations(db: Session) -> list[models.ProjectReservation] | None:
    return db.query(models.ProjectReservation).all()


def get_action_history(db: Session, group_id: int) -> list[models.ActionHistory] | None:
    return db.query(models.ActionHistory).filter(models.ActionHistory.groupid == group_id).all()


def get_action_history_id(db: Session, id: int):
    return db.query(models.ActionHistory).filter(models.ActionHistory.historyid == id).first()


def get_all_history(db: Session):
    return db.query(models.ActionHistory).all()


def histories_whole_info(db: Session):
    histories = get_all_history(db)
    histories = sorted(histories, key=lambda x: x.datatime, reverse=True)
    complexHistory = []
    for history in histories:
        project = get_project_reservation_by_group(db, history.groupid)
        if project is not None:
            proj = project.projectid
        else:
            proj = None
        complexHistory.append({"group": history.groupid, "historyid": history.historyid, "content": history.content,
                               "date": history.datatime, "project": proj,"displayed":history.displayed})
    return complexHistory


def get_group_by_invite_code(db: Session, invite_code: str) -> models.ProjectGroup | None:
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.invitecode == invite_code).first()


def get_group(db: Session, groupid: int):
    return db.query(models.ProjectGroup).filter(models.ProjectGroup.groupid == groupid).first()


def get_group_members(db: Session, groupid: int) -> list[models.Users] | None:
    return db.query(models.Users).filter(models.Users.groupid == groupid).all()


def project_search(db:Session, text:str) -> list[models.Project] | None:
    projects=[]
    projectName= db.query(models.Project).filter(models.Project.projecttitle.icontains(text)).all()
    projectCompany=db.query(models.Project).filter(models.Project.companyname.icontains(text)).all()
    projects= list(set(projectCompany) | set(projectName))
    return projects

def group_search(db: Session, text: str) -> list[models.ProjectGroup] | None:
    groups = []
    match = []
    array = getNumbers(text)
    if len(array) > 0:
        for a in array:
            if get_group(db, a):
                match.append(get_group(db, a))
    all_groups = db.query(models.ProjectGroup).all()
    for group in all_groups:
        if has_group_reservation(db, group.groupid):
            reservation = get_project_reservation_by_group(db, group.groupid)
            project = get_project_by_id(db, reservation.projectid)
            if text in project.companyname:
                groups.append(group)
            if text in project.projecttitle:
                groups.append(group)

    #groups = groups+match
    groups =list( set(groups)| set(match))
    if groups:
        groups.sort(key=lambda x: x.groupid)
    return get_groups_info(db, groups)

def reservation_search(db: Session, text: str) -> list[models.ProjectReservation] | None:
    reservations = []
    match = []
    array = getNumbers(text)
    if len(array) > 0:
        for a in array:
            reservation = get_project_reservation_by_group(db,a)
            match.append(reservation)
    all_reservations = get_all_reservations(db)
    for reservation in all_reservations:
        project = get_project_by_id(db, reservation.projectid)
        if text in project.companyname:
            reservations.append(reservation)
        if text in project.projecttitle:
            reservations.append(reservation)

    #reservations = reservations+match
    reservations =list(set(reservations)|set(match))
    return reservations




def get_groups_info(db:Session, groups: list[models.ProjectGroup]):
    ids = []
    leaders = []
    groupsizes = []
    guardians = []
    themas = []
    firms = []
    for group in groups:
        ids.append(group.groupid)
        leaders.append(get_group_leader(db, group.groupid))
        groupsizes.append(group.groupsize)
        guardians.append(group.guardianid)
        reservation = get_project_reservation_by_group(db, group.groupid)
        if reservation is None:
            themas.append(None)
            firms.append(None)
        else:
            project = get_project_by_id(db, reservation.projectid)
            themas.append(project.projecttitle)
            firms.append(project.companyname)
    return {"groupids": ids, "leaders": leaders, "groupsize": groupsizes, "guardians": guardians,
            "project_titles": themas, "companys": firms}

def get_all_groups_info(db:Session):
    groups = db.query(models.ProjectGroup).all()
    return get_groups_info(db,groups)


def get_group_leader(db: Session, groupid: int) -> models.Users | None:
    members = get_group_members(db, groupid)
    for member in members:
        if member.rolename == 'leader':
            return member
    return None


def get_guardian(db: Session, id: int) -> models.Guardian | None:
    return db.query(models.Guardian).filter(models.Guardian.guardianid == id).first()


def get_guardian_byEmail(db: Session, email: str) -> models.Guardian | None:
    return db.query(models.Guardian).filter(models.Guardian.email == email).first()

def get_project_reservations_by_status(db:Session, status:str) -> list[models.ProjectReservation] | None:
    return db.query(models.ProjectReservation).filter(models.ProjectReservation.status == status).all()



"""
Update
"""


def update_user_role(db: Session, user: schemas.UserBase, role: str) -> schemas.UserReturn:
    user.rolename = role
    db.commit()
    db.refresh(user)
    return user


def update_to_admin(db: Session, email: str):
    """
    Change user role from "student to "admin
    """
    user = get_user_by_email(db, email)
    if user.groupid is None:
        user.rolename = "admin"
        db.commit()
        db.refresh(user)


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
    deleted = group == None
    if group is not None:
        if increase:
            if group.groupsize + 1 > maximumgroupsize:
                raise exceptions.GroupSizeExccededException
            else:
                group.groupsize += 1
        else:
            if group.groupsize == 1:
                #   raise exceptions.MinimumSizeGroupException
                delete_group(db, group)
                deleted = True
            else:
                group.groupsize -= 1
    if not deleted:
        db.commit()
        db.refresh(group)


def update_user_group_id(db: Session, user: schemas.UserReturn, group: int) -> Exception | schemas.UserReturn:
    """
    Actualize students assigmnet to a group
    If group to which user wants to join already has reservation then change is not possible, same happens if user's current group has reservation (GroupWithReservation)
    In other case if user's rolename is "Student" then the change is done and the group size of both groups is changed \n
    If users rolename is "leader", then its sure that user belongs to group and therefore None case is not evaluated,
    if users's current group's size is 1, then change is possible but the rolename of user is changed to "student" and his current group is automatically deleted.
    If user's current group size is not 1 then raises LeaderException
    :param db: Session
    :param user: user whose group is changing
    :param group: id of user's new group
    :raises exceptions.GroupWithReservation
    :raises exceptions.LeaderException
    """
    if (user.groupid is not None) and has_group_reservation(db, user.groupid):
        raise exceptions.GroupWithReservation
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
            elif user.groupid != group:
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
                update_group_group_size(db, group, True)
                db.commit()
                db.refresh(user)
                delete_group(db, user_group)
            else:
                raise exceptions.LeaderException
    else:
        raise exceptions.GroupWithReservation
    return user


def update_project_group_guardian(db: Session, gid: int, guardian: int):
    """
    Change the group's guardian
    """
    group = get_group(db, gid)
    if (group.guardianid is None) or (group.guardianid != guardian):
        group.guardianid = guardian
        db.commit()
        db.refresh(group)
    return group


def update_action_history_displayed(db: Session, history: schemas.ActionHistoryBase):
    """
    Change the displayed atribute of actionHistory to True
    """
    history.displayed = True
    db.commit()
    db.refresh(history)
    return history


"""
Jesli doda sie pliki to rezerwacja ma status waiting na konfirmacje admina (?) 
Dodanie pliku tworzy rowniez actionhistory o tym
"""


def update_project_reservation_files(db: Session, reservation: schemas.ProjectReservationBase, path):
    """
    Add files with confirmation for the reservation, creates an actionHistory saying that files had been added
    :return : returns the changed reservation

    UWAGA DO SERWERA: czy argumnent path jest konieczny, czy ma byc po prostu grupa z rezerwacji
    """
    if path:
        reservation.confirmationpath = path
        reservation.status = "waiting"
        db.commit()
        db.refresh(reservation)
        create_action_history(db, reservation.groupid,
                              contentA=f"Dodano pliki. Znajdują sie w lokalizacji {reservation.confirmationpath}")
    else:
        reservation.confirmationpath = path
        reservation.status = "reserved"
        db.commit()
        db.refresh(reservation)
        create_action_history(db, reservation.groupid,
                              contentA="Plik potwierdzenia zostal usunięty")
    return reservation


def update_project_reservation_isConfirmed(db: Session, reservation: schemas.ProjectReservationReturn):
    """
    Confirm teh project reservation - action that should be made by an admin - gives some problems
    """
    reservation.status = "confirmed"
    # reservation.isconfirmed = True // NIE MAMY ISCONFIRMED
    db.commit()
    db.refresh(reservation)
    project=get_project_by_id(db,reservation.projectid )
    create_action_history(db, reservation.groupid, contentA=f"Zatwierdzono realizację tematu {project.projecttitle} (firma: {project.companyname}).")
    return reservation

def update_project_logopath(db: Session, project_name: schemas.ProjectBase, path: str):
    """
    Update project logopath- action made by admin
    """
    projects =get_project_by_company(db,project_name.companyname)

    for project in projects:
        project.logopath = path
        db.commit()
        db.refresh(project)

    return projects

"""stu
Delete
"""


def delete_user(db: Session, user: schemas.UserReturn):
    """
    Cant delete a leader, if user is the only member of his grop, then the group is deleted,
    Otherwise groupsize is decremented
    """
    group_id = user.groupid
    if group_id is not None:
        group = get_group(db, group_id)
    else:
        group = None
    if user.rolename == "leader" and group.groupsize > 1:
        raise exceptions.LeaderException
    try:
        if group is not None:
            update_group_group_size(db, group_id, False)
    except exceptions.MinimumSizeGroupException:
        delete_group(db, group)
    db.delete(user)
    db.commit()


# def delete_all_users(db: Session):
#     db.query(models.Users).filter(models.Users.groupid is not None, models.Users.rolename != "admin").delete()
#     db.commit()
# def delete_all_projects(db: Session):
#     db.query(models.Project).delete()
#     db.commit()
#
# def delete_all_actionshistory(db: Session):
#     db.query(models.ActionHistory).delete()
#     db.commit()
#
# def delete_all_projectreservations(db: Session):
#     db.query(models.ProjectReservation).delete()
#     db.commit()
#
# def delete_all_guardians(db: Session):
#     db.query(models.Guardian).delete()
#     db.commit()
#
# def delete_all_projectgroups(db: Session):
#     db.query(models.ProjectGroup).delete()
#     db.commit()
def delete_project(db: Session, project: schemas.Project):
    """
    Deletes a project and every reservation of this project
    """
    reservations = get_project_reservation_by_project(db, project.projectid)
    if reservations is not None and len(reservations) > 0:
        for reservation in reservations:
            delete_project_reservation(db, reservation)

    db.delete(project)
    db.commit()


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
            delete_ALL_action_history_of_one_group(db, group.groupid)
            db.delete(group)
            db.commit()
    except Exception:
        db.rollback()
        raise exceptions.GroupWithReservation


def delete_group_admin(db: Session, group: schemas.ProjectGroupReturn):
    """
    Delete a group from database - admin version - can delete a group even if it has members or reservation
    If user was in a group, his group is changed to None
    """
    if has_group_reservation(db, group.groupid):
        reservation = get_project_reservation_by_group(db, group.groupid)
        delete_project_reservation(db, reservation)
    members = get_group_members(db, group.groupid)
    if len(members) != 0:
        for member in members:
            member.groupid = None
            member.rolename = "student"
    db.delete(group)
    db.commit()


def delete_project_reservation(db: Session, reservation: schemas.ProjectReservationBase):
    """
    This deletes a reservation as well as all acton history connected to that - NOPE
    :param db:
    :param reservation:
    :return:
    """
    #delete_ALL_action_history(db, reservation.groupid)
    project=get_project_by_id(db, reservation.projectid)
    create_action_history(db, reservation.groupid, f"Usunieto rezerwacje projektu {project.projecttitle} (firma: {project.companyname}).)")
    db.delete(reservation)
    db.commit()


def delete_ALL_action_history_of_one_group(db: Session, groupid: int):
    """
    Deltes all action history attached to a project reservation
    """
    db.query(models.ActionHistory).filter(models.ActionHistory.groupid == groupid).delete()
    db.commit()


def delete_action_history(db: Session, action: schemas.ActionHistoryBase):
    """
    Deletes specific action
    """
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
    """
    Deleted everything
    """
    db.query(models.Users).update({models.Users.groupid: None})
    db.commit()

    db.query(models.Users).filter(models.Users.groupid is not None, models.Users.rolename != "admin").delete()
    db.query(models.Project).delete()
    db.query(models.ActionHistory).delete()
    db.query(models.ProjectReservation).delete()
    db.query(models.Guardian).delete()
    db.query(models.ProjectGroup).delete()

    # delete_all_projects(db)
    # delete_all_users(db)
    # delete_all_actionshistory(db)
    # delete_all_projectreservations(db)
    # delete_all_projectgroups(db)
    # delete_all_guardians(db)
    db.commit()





"""
Inne potrzebne funkcje
"""


def is_project_available(db: Session, pid: int) -> bool:
    """
    :return: True if the number of project reservation is lower than the maximum limit so the project can still be reserved, returns False in other case
    """
    return number_project_reserved(db, pid) < (get_project_by_id(db, pid)).groupnumber


def is_size_valid(project: models.Project, group: models.ProjectGroup) -> bool:
    """
    Checks if the group size is valid for the project
    """
    return project.mingroupsize <= group.groupsize <= project.maxgroupsize


def number_project_reserved(db: Session, pid: int) -> int:
    """
    Returns number of reservation of particular project (which id is pid)
    """
    return db.query(models.ProjectReservation).filter(models.ProjectReservation.projectid == pid).count()


def generate_invite_code(size=6, chars=string.ascii_uppercase + string.digits) -> str:
    """
    Do czasu znalezienia lepszego miejsca tutaj daje
    :return: losowe haslo wstepu do grupy
    """
    return ''.join(random.choice(chars) for _ in range(size))


def has_group_reservation(db: Session, gid: int):
    """
    Checks if group has made a project rseesrvation
    """
    return get_project_reservation_by_group(db, gid) is not None


def getNumbers(str):
    array = re.findall(r'[0-9]+', str)
    return array


def readTimeOfSubscribtion():
    """
    Data zapisow jest wprowadzana do pliku, PAMIETAC O SCIEZCE DO NIEGO jak damy na serwer
    """
    file = open('docs/zapisy.txt', 'r')
    date_str = file.readline()
    date_format = '%d.%m.%Y %H:%M:%S'
    date_obj = datetime.strptime(date_str, date_format)
    file.close()
    return date_obj


def setTimeOfSubscribtion(data:str):
    file = open('docs/zapisy.txt', 'w')
    file.write(data)
    file.close()


def isTimeValid() -> bool:
    return datetime.now() > readTimeOfSubscribtion()

# def validate_pdf(file: UploadFile):
#     """
#     Checks if file is in PDF format
#     """
#     mime = Magic(mime=True)
#     file_type = mime.from_buffer(file.file.read(1024))
#     if file_type != 'application/pdf':
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed")
#     return file
# #

#######################
#Sekcja do autoryzacji#
#######################

def check_user(db: Session, email: str, keycloackid: str):
    db_user = db.query(models.Users).filter(models.Users.email == email).first()
    if db_user.keycloackid != keycloackid:
        return None
    else:
        return db_user
