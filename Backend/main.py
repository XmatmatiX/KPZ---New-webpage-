from __future__ import annotations

from enum import Enum
from typing import Optional

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import FastAPI, Request
from fastapi import Depends, HTTPException, status, Security, UploadFile, File

from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
# from magic import Magic
import os
import shutil
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext

#from pydantic import parse_obj_as, ValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

import models, schemas, CRUD, exceptions
from database import SessionLocal, engine

from config import ORIGINS


SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RoleEnum(str, Enum):
    student = "student"
    leader = "leader"
    admin = "admin"


class ProjectStatus(str, Enum):
    available = "available"
    reserved = "reserved"

"""
Statusy rezerwacji: "reserved"  -zarezerwowano
 "waiting" - wyslano pliki
"confirmed" - potwierdzono
"""
class ReservationStatus(str, Enum):
    reserved = "reserved"
    waiting = "waiting"
    confirmed = "confirmed"


app = FastAPI(
    servers=[
        {"url": "https://projekty.kpz.pwr.edu.pl", "description": "KPZ APP by name "},
        {"url": "http://156.17.197.70", "description": "KPZ APP by IP"},

    ],
    #root_path="/api",
    # root_path_in_servers=False,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# proxy_prefix = "/api/v1"
# proxy_url = "http://0.0.0.0:9999" + proxy_prefix

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# funkcja sprawdzająca, czy istnieje użytkownik o podanym email oraz keycloackid
def authenticate_user(db: Session, email: str, keycloackid: str):
    user = CRUD.get_user_by_email(db, email)
    if not verify_password(keycloackid, user.keycloackid):
        return None
    return user


# funkcja odpowiadajaca za tworzenie tokenow JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

######################################
# funkcje odpowiadajace za autoryzacje
######################################

# funkcja sprawdzajaca czy uzytkownik jest adminem
def is_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials",
                                          headers={"WWW-Authenticate": "Bearer"})

    role_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="You don't have Admin role",
                                          headers={"WWW-Authenticate": "Bearer"})

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role")
        if role is None:
            raise credentials_exception

        token_data = schemas.TokenData(role=role)
    except JWTError:
        raise credentials_exception

    if token_data.role != RoleEnum.admin.value:
        raise role_exception

    return token_data




# funkcja pobierająca aktualnego uzytkownika
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials",
                                          headers={"WWW-Authenticate": "Bearer"})

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = schemas.TokenData(email=email)

    except JWTError:
        raise credentials_exception

    user = CRUD.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception

    return user

@app.post("/Register", response_model= schemas.Token)
def register(newUser : schemas.UserRegisterPassword, db: Session = Depends(get_db)):
    user_exist = CRUD.get_user_by_email(db, newUser.email)
    if user_exist:
      return {"message": "User already exists"}



    new_user = schemas.UserCreate(
        name=newUser.name,
        surname=newUser.surname,
        email=newUser.email,
        rolename=RoleEnum.student,
        keycloackid=hash_password(newUser.password)
    )
    CRUD.create_user(db, new_user)

    user = authenticate_user(db, newUser.email, newUser.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_role = user.rolename

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user_role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model= schemas.Token)
def login(userLogin : schemas.UserLoginPassword, db: Session = Depends(get_db)):
    user_exist = CRUD.get_user_by_email(db, userLogin.email)

    if not user_exist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account with this email",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = authenticate_user(db, userLogin.email, userLogin.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_role = user.rolename

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user_role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/User/Role")
def authTest(current_user = Depends(get_current_user)):
    """
        Zwraca rolę zalogowanego użytkownika
    """
    return current_user.rolename;


@app.get("/ProjectList")
def project_list(db: Session = Depends(get_db)):
    projects = CRUD.get_all_projects(db)

    logos = []
    companynames = []
    titles = []
    pid = []
    minsizes = []
    maxsizes = []
    stats = []
    for project in projects:
        n = CRUD.number_project_reserved(db, project.projectid)
        for i in range(project.groupnumber):
            logos.append(project.logopath)
            companynames.append(project.companyname)
            titles.append(project.projecttitle)
            pid.append(project.projectid)
            minsizes.append(project.mingroupsize)
            maxsizes.append(project.maxgroupsize)
            if i < n:
                stats.append(ProjectStatus.reserved)
            else:
                stats.append(ProjectStatus.available)
    return {"logos": logos, "companynames": companynames, "titles": titles, "projecstid": pid, "minsizes": minsizes,
            "maxsizes": maxsizes, "status": stats}

@app.get("/ProjectListSearch/{parameter}")
def project_list(parameter:str,db: Session = Depends(get_db)):
    projects = CRUD.project_search(db, parameter)

    logos = []
    companynames = []
    titles = []
    pid = []
    minsizes = []
    maxsizes = []
    stats = []
    for project in projects:
        n = CRUD.number_project_reserved(db, project.projectid)
        for i in range(project.groupnumber):
            logos.append(project.logopath)
            companynames.append(project.companyname)
            titles.append(project.projecttitle)
            pid.append(project.projectid)
            minsizes.append(project.mingroupsize)
            maxsizes.append(project.maxgroupsize)
            if i < n:
                stats.append(ProjectStatus.reserved)
            else:
                stats.append(ProjectStatus.available)
    return {"logos": logos, "companynames": companynames, "titles": titles, "projecstid": pid, "minsizes": minsizes,
            "maxsizes": maxsizes, "status": stats}


@app.get("/ProjectListFree")
def project_list( db: Session = Depends(get_db)):
    projects = CRUD.get_all_projects(db)
    logos = []
    companynames = []
    titles = []
    pid = []
    minsizes = []
    maxsizes = []
    stats = []
    for project in projects:
        n = CRUD.number_project_reserved(db, project.projectid)
        for i in range(project.groupnumber):
            if i >=n:
                logos.append(project.logopath)
                companynames.append(project.companyname)
                titles.append(project.projecttitle)
                pid.append(project.projectid)
                minsizes.append(project.mingroupsize)
                maxsizes.append(project.maxgroupsize)
                stats.append(ProjectStatus.available)
    return {"logos": logos, "companynames": companynames, "titles": titles, "projecstid": pid, "minsizes": minsizes,
            "maxsizes": maxsizes, "status": stats}

@app.get("/Project/{id}")
def project_detail(id: int, db: Session = Depends(get_db)):
    project = CRUD.get_project_by_id(db, id)
    if project is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono projektu")
    num_taken = CRUD.number_project_reserved(db, project.projectid)
    return {"id": id, "logo": project.logopath ,"companyname": project.companyname, "title": project.projecttitle,
            "description": project.description, "technologies": project.technologies, "minsize": project.mingroupsize, "maxsize": project.maxgroupsize,
            "groupnumber": project.groupnumber, "remarks": project.remarks, "cooperationtype": project.cooperationtype,
            "numertaken": num_taken, "language": project.englishgroup}

@app.get("/TimeReservation")
def get_time_for_resrvation():
    return {"datatime": CRUD.readTimeOfSubscribtion()}

########### SEKCJA ADMIN ################
@app.get("/Admin/ProjectList")
def admin_project_list(role = Depends(is_admin),db: Session = Depends(get_db)):
    projects = CRUD.get_all_projects(db)

    return {"projects:": projects}

    # logos = []
    # companynames = []
    # titles = []
    # pid = []
    # minsizes = []
    # maxsizes = []
    # stats = []
    # groups = []
    # for project in projects:
    #     n = CRUD.number_project_reserved(db, project.projectid)
    #     groups_project = CRUD.get_groups_assigned_to_projects(db, project)
    #     for i in range(project.groupnumber):
    #         logos.append(project.logopath)
    #         companynames.append(project.companyname)
    #         titles.append(project.projecttitle)
    #         pid.append(project.projectid)
    #         minsizes.append(project.mingroupsize)
    #         maxsizes.append(project.maxgroupsize)
    #         if i < n:
    #             stats.append(ProjectStatus.reserved)
    #             groups.append(groups_project[i])
    #         else:
    #             stats.append(ProjectStatus.available)
    #             groups.append(None)
    # return {"logos": logos, "companynames": companynames, "titles": titles, "projecstid": pid, "minsizes": minsizes,
    #         "maxsizes": maxsizes, "status": stats, "group": groups}

@app.get("/Admin/ProjectListSearch/{parameter}")
def admin_project_list(parameter:str,role = Depends(is_admin), db: Session = Depends(get_db)):
    projects = CRUD.project_search(db, parameter)

    return {"projects:": projects}


@app.get("/Admin/Project/{id}")
def admin_project(id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    return CRUD.get_project_by_id(db, id)
@app.get("/Admin/Reservations")
def admin_reservation(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
            lista rezerwacji
    """
    reservations = CRUD.get_all_reservations(db)
    rid=[]
    logos = []
    company = []
    topic = []
    project_group = []
    status = []

    for reservation in reservations:
        project = CRUD.get_project_by_id(db, reservation.projectid)
        rid.append(reservation.projectreservationid)
        logos.append(project.logopath)
        company.append(project.companyname)
        topic.append(project.projecttitle)
        project_group.append(reservation.groupid)
        status.append(reservation.status)

    return {
        "reservations_id": rid,
        "logos": logos,
        "company": company,
        "topic": topic,
        "project_group": project_group,
        "status": status
    }

@app.get("/Admin/Reservation/{project_id}")
def admin_reservation(project_id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
            Zwraca dane o danej rezerwacji
            UWAGA: id jest rezerwacji a nie projektu
            id jest rezerwacji a nie projektu!!
    """
    reservation = CRUD.get_project_reservation_by_id(db, project_id)
    project = CRUD.get_project_by_id(db, reservation.projectid)
    return {"company": project.companyname,"id": project_id, "thema": project.projecttitle, "group":reservation.groupid,
            "state": reservation.status, "pid": project.projectid}


@app.get("/Admin/ReservationStatus/{status}")
def admin_reservation(status: str, role = Depends(is_admin), db: Session = Depends(get_db)):
    """status to jeden z ReservationStatus"""
    reservations = CRUD.get_project_reservations_by_status(db, status)
    rid = []
    logos = []
    company = []
    topic = []
    project_group = []
    statuses = []
    for reservation in reservations:
        rid.append(reservation.projectreservationid)
        project = CRUD.get_project_by_id(db, reservation.projectid)
        logos.append(project.logopath)
        company.append(project.companyname)
        topic.append(project.projecttitle)
        project_group.append(reservation.groupid)
        statuses.append(status)

    return {"reservations_id": rid,
    "logos": logos,
    "company": company,
    "topic": topic,
    "project_group": project_group,
    "status": statuses}


@app.get("/Admin/ReservationSearch/{parameter}")
def search_reservation(parameter: str, role = Depends(is_admin), db: Session = Depends(get_db)):
    """status to jeden z ReservationStatus"""
    reservations = CRUD.reservation_search(db, parameter)
    rid = []
    logos = []
    company = []
    topic = []
    project_group = []
    statuses = []
    for reservation in reservations:
        rid.append(reservation.projectreservationid)
        project = CRUD.get_project_by_id(db, reservation.projectid)
        logos.append(project.logopath)
        company.append(project.companyname)
        topic.append(project.projecttitle)
        project_group.append(reservation.groupid)
        statuses.append(reservation.status)

    return {"reservations_id": rid,
    "logos": logos,
    "company": company,
    "topic": topic,
    "project_group": project_group,
    "status": statuses}

@app.get("/Admin/Group/{id}")
def admin_group(id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Do poprawy - zawezic to co o uzytkowniku widac
    """
    group= CRUD.get_group(db, id)
    if group is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")
    members = CRUD.get_group_members(db, id)
    reservation = CRUD.get_project_reservation_by_group(db, id)
    if reservation is not None:
        project = CRUD.get_project_by_id(db, reservation.projectid)
        thema=project.projecttitle
        company= project.companyname
        status=reservation.status
        path=reservation.confirmationpath
    else:
        thema=None
        company=None
        status=None
        path=None
    return {"id": id, "members": members, "thema": thema, "company": company,
            "state": status, "guardian": group.guardianid, "confirmation-path": path}

@app.get("/Admin/Groups")
def admin_groups(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
        Zwraca wszystkie grupy
    """
    groups = CRUD.get_all_groups_info(db)
    return {"groups:": groups}

@app.post("/Admin/SearchGroup/{parameter}")
def search_groups(parameter: str, role = Depends(is_admin), db: Session = Depends(get_db)):
    groups = CRUD.group_search(db, parameter)
    return {"groups:": groups}


@app.get("/Admin/FreeStudents")
def admin_free_students(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
        Zwraca wszytskich zalogowanych studentow bez grup
    """
    students = CRUD.get_free_students(db)
    return {"students:": students}

    student_ids = []
    student_names = []
    student_surnames = []
    student_indexes = []

    for student in students:
        # Dodawanie atrybutów do odpowiednich list
        student_ids.append(student.userid)
        student_names.append(student.name)
        student_surnames.append(student.surname)
        student_indexes.append(student.index)

    # Zwracanie wyniku jako słownik
    return {
        "id": student_ids,
        "name": student_names,
        "surname": student_surnames,
        "index": student_indexes
    }
@app.get("/Admin/GroupsWithoutProject")
def free_groups(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
        Zwraca grupy bez rezerwacji
    """
    groups = CRUD.get_group_without_project(db)
    return {"groups:": groups}

@app.post("/Admin/SearchStudent/{parameter}")
def search_students(parameter: str, role = Depends(is_admin), db: Session = Depends(get_db)):
    students = CRUD.get_user_by_something(db, parameter)
    ids=[]
    names = []
    surnames = []
    groups = []
    roles = []
    emails =[]
    for student in students:
        ids.append(student.userid)
        names.append(student.name)
        surnames.append(student.surname)
        groups.append(student.groupid)
        roles.append(student.rolename)
        emails.append(student.email)
    return {"ids": ids,"names": names, "surnames": surnames, "groups": groups, "roles": roles, "emails":emails}

@app.get("/Admin/Students")
def get_students(role = Depends(is_admin), db: Session = Depends(get_db)):
    students = CRUD.get_all_students(db)
    ids=[]
    names = []
    surnames = []
    groups = []
    emails=[]
    for student in students:
        ids.append(student.userid)
        names.append(student.name)
        surnames.append(student.surname)
        groups.append(student.groupid)
        emails.append(student.email)
    return {"ids":ids,"names": names, "surnames": surnames, "groups": groups, "emails":emails}

@app.get("/Admin/Student/{id}")
def get_student(id:int, role = Depends(is_admin), db:Session=Depends(get_db)):
    """
            Szczegoly studenta - UWAGA ZMIANA W ZWRACANIU - zeby nie zwracac poufnych informacji

    """
    student=CRUD.get_user_by_id(db,id)
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    #return {"student":student}
    return {"name": student.name, "surname": student.surname, "email": student.email, "group": student.groupid }

@app.get("/Admin/Guardian/{id}")
def get_guardian(id:int, role = Depends(is_admin), db: Session=Depends(get_db)):
    guardian=CRUD.get_guardian(db, id)
    if not guardian:
        raise HTTPException(status_code=404, detail="Nie odnaleziono opiekuna")
    return {"name": guardian.name, "surname": guardian.surname, "email": guardian.email}

@app.put("/Admin/AdminCreate/{email}")
def put_admin_create(email:str, role = Depends(is_admin), db:Session=Depends(get_db)):
    """
    Nadanie user praw admina
    """
    student=CRUD.get_user_by_email(db,email)
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if student.rolename ==RoleEnum.admin.value:
        raise HTTPException(status_code=404, detail="Użytkownik już posiada prawa administratora")
    if student.groupid:
        raise HTTPException(status_code=404, detail="Admin nie może być zapisany do grupy projektowej")

    CRUD.update_to_admin(db,email)
    return {"message": "Udało się stworzyć admina"}

@app.get("/Admin/AdminList")
def get_admins(role = Depends(is_admin), db: Session = Depends(get_db)):
    admins = CRUD.get_admins(db)
    ids=[]
    names = []
    surnames = []
    groups = []
    emails=[]
    for admin in admins:
        ids.append(admin.userid)
        names.append(admin.name)
        surnames.append(admin.surname)
        groups.append(admin.groupid)
        emails.append(admin.email)
    return {"ids":ids,"names": names, "surnames": surnames, "email": emails}

@app.post("/Admin/SignToGroup/{user_id}{groupId}")
def post_sign_to_group(user_id:int, groupId:int, role = Depends(is_admin), db:Session=Depends(get_db)):
    """
            Przypisanie studenta do danej grupy.

    """
    student=CRUD.get_user_by_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    group= CRUD.get_group(db, groupId)

    if not group:
        raise HTTPException(status_code=404, detail="Grupa o podanym identyfikatorze nie istnieje")
    try:
        CRUD.update_user_group_id(db, student, group.groupid)
        return {"message": "Udało się dołączyć do  grupy"}
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=404, detail="Skład grupy z rezerwacją nie może być zmieniany")
    except exceptions.LeaderException:
        raise HTTPException(status_code=404, detail="Lider grupy nie może zmienić grupy")
    except exceptions.GroupSizeExccededException:
        raise HTTPException(status_code=404, detail="Grupa jest zbyt duża, aby przyjąć więcej użytkowników")
    except exceptions.MinimumSizeGroupException:
        raise HTTPException(status_code=404, detail="Grupa ma zbyt mało członków")

@app.post("/Admin/AddProject")
def post_add_project(project: schemas.ProjectCreate, groupID: Optional[int] = None, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Dodawanie nowego projektu przez admina
    z dodatkową opcją przypisania do grupy
    """
    try:

        # Create the project
        created_project = CRUD.create_project(db, project)
        print(f"Created project: {created_project}")

        if groupID:
            # Check if the group exists
            group = CRUD.get_group(db, groupID)
            if not group:
                raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")
            print(f"Found group: {group}")

            # Check if the group already has a reservation
            if CRUD.has_group_reservation(db, groupID):
                raise HTTPException(status_code=400, detail="Grupa zarezerwowała już projekt")
            print(f"Group {groupID} does not have a reservation")
            try:
                # Create a new project reservation
                new_reservation = CRUD.create_project_reservation(db, created_project, group)
                print(f"Created new reservation: {new_reservation}")
            except exceptions.NotTimeForReservationException:
                raise HTTPException(status_code=400, detail="Nie można dokonać rezerwacji, ponieważ czas na zapisy jeszcze nie nadszedł")
            except exceptions.ProjectNotAvailableException:
                raise HTTPException(status_code=400, detail="Projekt jest już zajęty")
            except exceptions.GroupSizeNotValidForProjectException:
                raise HTTPException(status_code=400, detail="Rozmiar grupy nie odpowiada wymaganiom projektu")

        return {"message": "Udało się dodać projekt"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Zaszedł błąd", "error": str(e)})

@app.get("/Admin/Notification")
def get_notifications(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Zwraca cala action history
    """
    all_history = CRUD.histories_whole_info(db)
    return all_history

@app.get("/Admin/Notification/{id}")
def get_notification_by_id(id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Zwraca action history o konkretnym id - skoro to zwracamy, to automatycznie action hisotyr jest zmieniane na displayed=TRUE
    """
    notification = CRUD.get_action_history_id(db, id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono powiadomienia")
    CRUD.update_action_history_displayed(db, notification)
    return notification

@app.get("/Admin/{group_id}/Notification")
def get_group_action_history(group_id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Zwraca cale action history konkretnej grupy  - albo pusta liste jesli nic nie ma
    """
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    history = CRUD.get_action_history(db, group_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono powiadomienia")
    return history

@app.delete("/Admin/Notification/{id}")
def delete_notification_by_id(id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Usuwa konkretne action history
    """
    action = CRUD.get_action_history_id(db, id)
    if action is None:
        return {"message": "Powiadomienie nie istnieje"}
    CRUD.delete_action_history(db, action)
    return {"message": "Pomyślnie usunięto powiadomienie"}


@app.delete("/Admin/{group_id}/Notification")
def delete_group_action_history(group_id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Deletes all action history referred to a group with id
    """
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")
    CRUD.delete_ALL_action_history_of_one_group(db, group_id)
    return {"message": "Usunięto wszytskie powiadomienia związane z grupą"}

@app.delete("/Admin/database-clear")
def delete_database(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Deletes database -wont delete any admin!
    """
    CRUD.delete_all(db)
    return {"message": "Wyczyszczenie danych z bazy przebiegło pomyślnie"}

@app.put("/Admin/AdminDelete/{id}")
def delete_admin(id: int, role = Depends(is_admin),db: Session= Depends(get_db)):
    """
    Nie mozna usunac konta kpz@pwr.edu.pl !! -> Superadmin
    """
    admin = CRUD.get_user_by_id(db, id)
    if admin.email == "kpz@pwr.edu.pl":
        return {"message": "Nie można usunąć głównego administratora (kpz@pwr.edu.pl)"}
    if admin is None:
        return {"message": "Taki admin nie istnieje"}
    CRUD.delete_user(db, admin)
    return {"message": "Pomyślnie usunięto administratora"}

@app.post("/Admin/UploadProjects")
def post_uploads_projects(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Tworzenie projektow w bazie na podstawie zamieszczonego excel
    """
    file_path = 'docs/forms/KPZ_FORMS.xlsx'  # Dodaj ścieżkę do pliku
    projects=[]
    projects.append(CRUD.create_project_from_forms(db, file_path))
    return {"message": "Załadowanie projektów przebiegło pomyślnie", "projects":projects}

@app.put("/Admin/Group/{group_id}/Confirm")
def confirm_realization(group_id: int, role = Depends(is_admin), db: Session = Depends(get_db)):
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")
    if not CRUD.has_group_reservation(db, group_id):
        raise HTTPException(status_code=404, detail="Grupa nie ma rezerwacji")
    reservation = CRUD.get_project_reservation_by_group(db, group_id)
    CRUD.update_project_reservation_isConfirmed(db, reservation)
    return {"message": "Zatwierdzono realizację projektu przez grupę"}

@app.delete("/Admin/DeleteProject/{id}")
def delete_project(id:int, role = Depends(is_admin), db: Session = Depends(get_db)):
    project = CRUD.get_project_by_id(db, id)
    if project is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono projektu")
    CRUD.delete_project(db, project)
    return {"message": "Usunięto projekt"}


@app.put("/Admin/{project_id}/Logo")
def put_logo(project_id: str, logo_file:UploadFile=File(...), role = Depends(is_admin), db: Session = Depends(get_db) ):
    """
    Dodawanie loga firmy przez podanie nazwy firmy.
    Dodanie pliku oznacza nadpisanie poprzedniego. Sciezka pliku zapisuje sie w project.logopath.
    Logo zostanie ustawione do wszytskich tematow firmy
    """
    try:
        project = CRUD.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        save_path = os.path.join("docs", "logo", str(project.companyname))
        os.makedirs(save_path, exist_ok=True)

        # Check and remove existing logo files in the directory
        for filename in os.listdir(save_path):
            file_path = os.path.join(save_path, filename)
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)

        # Save the new logo file
        file_path = os.path.join(save_path, logo_file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(logo_file.file.read())

        # Update the project with the new logo path
        CRUD.update_project_logopath(db, project, str(file_path))

        return JSONResponse(status_code=200, content={"message": "Pomyślnie załadowano plik", "file_path": file_path})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Zaszedł błąd", "error": str(e)})
@app.post("/Admin/ExcelFile")
def post_excel(excel_file: UploadFile = File(...), role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Dodawanie pliku excel z forms
    Plik musi byc nazwany KPZ_FORMS.xlsx!!!!
    """
    try:
        # Określ ścieżkę, gdzie chcesz zapisać plik PDF
        save_path = os.path.join("docs","forms")

        os.makedirs(save_path, exist_ok=True)

        # Połącz ścieżkę i nazwę pliku
        file_path = os.path.join(save_path, excel_file.filename)

        # Sprawdź, czy plik już istnieje w katalogu
        if os.path.exists(file_path):
            raise HTTPException(status_code=409,
                                detail="Plik już istnieje. Jeśli chcesz go zastąpić, proszę usuń istniejący i załaduj nowy")

        # Zapisz przesłany plik na dysku
        with open(file_path, "wb") as buffer:
            buffer.write(excel_file.file.read())

        return JSONResponse(status_code=200, content={"message": "Pomyślnie załadowano plik", "file_path": file_path})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Zaszedł błąd", "error": str(e)})

@app.delete("/Admin/ExcelFile")
def delete_excel(role = Depends(is_admin), db: Session = Depends(get_db)):
    """
    Usuwanie pliku excel
    """
    try:
        directory_path = os.path.join("docs", "forms")

        # Sprawdź czy katalog istnieje
        if not os.path.exists(directory_path):
            raise HTTPException(status_code=404, detail="Nie odnaleziono folderu (ścieżki)")

        # Usuń wszystkie pliki w katalogu
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            os.remove(file_path)

        # Usuń pusty katalog
        os.rmdir(directory_path)

        return {"message": f"Usunięto wszystkie pliki z folderu"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zaszedł błąd: {str(e)}")


@app.post("/Admin/setTime/{year}:{month}:{day}:{hour}:{minute}:{second}")
def set_time_subscribtion(year:int, month:int, day:int, hour:int, minute:int, second:int, role = Depends(is_admin), db: Session = Depends(get_db)):
    data=f"{day}.{month}.{year} {hour}:{minute}:{second}"
    CRUD.setTimeOfSubscribtion(data)
    return {"message": f"ustawiono czas rezerwacji na {data}"}


########### SEKCJA STUDENT ################

@app.get('/Student/MemberType')
def get_student_type(student = Depends(get_current_user)):
    """
    Returns information about student. It contains information about
    being student with group, without group or being leader
    """
    print(student.rolename)
    if student.groupid is None:
        return {"memberType": "withoutGroup"}
    if student.rolename == "student":
        return {"memberType": "student"}
    if student.rolename == "leader":
        return {"memberType": "leader"}
    raise HTTPException(status_code=404, detail="Wystąpił błąd")



@app.get("/Student/Group")
def get_student_group(student = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns information about a group to which student with id belong
    id jest studenta!
    """
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono studenta")

    # Get the group of the student
    group = CRUD.get_group(db, student.groupid)
    if group is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")

    # Initialize lists for member details
    member_details = []

    # Get group members
    members = CRUD.get_group_members(db, group.groupid)

    # Check if the project is reserved
    reservation = CRUD.get_project_reservation_by_group(db, group.groupid)
    if reservation :
        project=CRUD.get_project_by_id(db, reservation.projectid)
        project_info = {
            "project_id": project.projectid,
            "project_title": project.projecttitle
        }
        status=reservation.status
        if status=="confirmed":
            # Project is reserved, get contact information
            contact_info = {
                "company": reservation.project.companyname,
                "contact_email": reservation.project.email,
                "contact_phone": reservation.project.phonenumber,
                "person": project.person
            }
        else:
            contact_info = {
                "company": reservation.project.companyname,
                "contact_email": None,
                "contact_phone": None,
                "person": None
            }
    else:
        status="None"
        project_info = {
            "project_id": None,
            "project_title": None
        }
        # Project is not reserved, set contact information to null
        contact_info = {
            "company": None,
            "contact_email": None,
            "contact_phone": None,
            "person": None
        }

    # Check if the group has a guardian
    guardian = CRUD.get_guardian(db, group.guardianid)
    if guardian:
        # Guardian exists, get guardian details
        guardian_info = {
            "guardian_name": f"{guardian.name} {guardian.surname}",
            "guardian_email": guardian.email
        }
    else:
        # Guardian does not exist, set guardian details to null
        guardian_info = {
            "guardian_name": None,
            "guardian_email": None
        }

    # Iterate over group members and get their details
    for member in members:
        member_details.append({
            "id":member.userid,
            "name": member.name,
            "surname": member.surname,
            "email":member.email,
            "role": member.rolename
        })

    # Return the group information along with student details
    return {
        "contact_info": contact_info,
        "guardian_info": guardian_info,
        "members": member_details,
        "invite_code": group.invitecode,
        "group_size": group.groupsize,
        "reservation_status": status,
        "project_info":project_info,
    }

@app.put("/Student/ChangeLeader/{id}")
def put_change_leader(id :int, student = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Change leader of a group <- the ID is of a new leader
    """
    user = CRUD.get_user_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="Nie odnalezioono użytkownika")

    # Sprawdź, czy użytkownik jest liderem
    if user.rolename != RoleEnum.leader.value:
        # Jeśli użytkownik nie jest liderem, zmień jego status na studenta
        user.rolename = RoleEnum.student.value

        # Znajdź aktualnego lidera i zmień jego status na studenta
        current_leader = CRUD.get_group_leader(db, user.groupid)
        if current_leader:
            current_leader.rolename = RoleEnum.student.value

        # Przypisz wybranego użytkownika jako lidera
        user.rolename = RoleEnum.leader.value

        # Zapisz zmiany w bazie danych
        db.commit()

    return {"message": "Zmieniono lidera"}

@app.post("/Student/Enroll/{project_id}")
def enroll_student_to_project( project_id: int, user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Makes reseravtion of a project - should be done by leader otherwise raise exception
    """

    if not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")

    # Sprawdź, czy użytkownik ma rolę lidera
    if user.rolename != "leader":
        raise HTTPException(status_code=403, detail="Musisz być liderem, żeby móc zapisać grupę na projekt")

    # Sprawdź, czy projekt istnieje
    project = CRUD.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Nie odnaleziono projektu")

    group = CRUD.get_group(db, user.groupid)
    if CRUD.has_group_reservation(db, group.groupid):
        raise HTTPException(status_code=404, detail="Twoja grupa ma już rezerwację!")
    try:
        # Spróbuj utworzyć rezerwację projektu
        new_reservation = CRUD.create_project_reservation(db, project, group)
    except exceptions.NotTimeForReservationException:
        raise HTTPException(status_code=400, detail="Nie mozna dokonac rezerwacji, poniewaz czas na zapisy jeszcze nie nadszedl")
    except exceptions.ProjectNotAvailableException:
        raise HTTPException(status_code=400, detail="Projekt jest już zajęty")
    except exceptions.GroupSizeNotValidForProjectException:
        raise HTTPException(status_code=400, detail="Rozmiar grupy nie odpowiada wymaganiom projektu")

    return {"message": "Udało się zapisać na projekt", "group_id": user.groupid, "project_name": project.projecttitle}

@app.delete("/Student/QuitProject")
def delete_reservation(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Rezegnacja grupy projektowej z rezerwacji projekt. Użytkownik musi byc liderem.
    """
    if user is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if user.groupid is None:
        raise HTTPException(status_code=404, detail="Użytkownik nie jest częścią żadnej grupy")
    if user.rolename != "leader":
        raise HTTPException(status_code=403, detail="Tylko lider może zarządzać rezerwacją")
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")
    if not CRUD.has_group_reservation(db, user.groupid):
        raise HTTPException(status_code=404, detail="Grupa nie zarezerwowała żadnego projektu")
    reservation = CRUD.get_project_reservation_by_group(db, group.groupid)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono rezerwacji")
    CRUD.delete_project_reservation(db,reservation)
    return {"message": "Usunięto rezerwację"}

@app.post("/Student/unsubscribe")
def unsubscribe_from_group(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Opuszczenie grupy projektowej. Lider nie może opuścić grupy, chyba że jest jedynym jej członkiem.
    W takim przypadku grupa zostanie usunięta
    """
    # Pobierz użytkownika
    if not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")

    # Sprawdź, czy użytkownik należy do jakiejkolwiek grupy
    if not user.groupid:
        raise HTTPException(status_code=400, detail="Użytkownik nie jest częścią żadnej grupy")

    # Pobierz grupę użytkownika
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")

    # Jeśli użytkownik jest liderem grupy, nie pozwól mu opuścić grupy
    #TO JUZ JEST SPRAWDZANE I PRZEWIDZIANE W CRUD <- zmiana jest mozliwa nawet jesli jest liderem jesli jest jedynym w groupi - patrz CRUD
    #if user.rolename == RoleEnum.leader.value:
    #    raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")

    # Jeśli użytkownik jest zwykłym członkiem grupy, usuń go z grupy
    try:
        CRUD.update_user_group_id(db, user, None)
    except exceptions.LeaderException:
        raise HTTPException(status_code=400, detail="Jako lider nie możesz opuścić grupy")
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=400, detail="Nie możesz opuścić grupy, która zarezerwowała projekt")

    # Zapisz zmiany w bazie danych
    db.commit()

    return {"message": "Użytkownik opuścił grupę"}

@app.post("/Student/unsubscribeSomeone/{someone_id}")
def unsubscribe_from_group(someone_id: int, user = Depends(get_current_user),  db: Session = Depends(get_db)):
    """
       Usuwanie członka grupy. Tylko Lider może usunąć członka grupy.
    """
    other_user = CRUD.get_user_by_id(db, someone_id)
    if not other_user or not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    # Sprawdź, czy użytkownik należy do jakiejkolwiek grupy
    if not user.groupid or  not other_user.groupid:
        raise HTTPException(status_code=400, detail="Użytkownik nie jest częścią żadnej grupy")
    if user.groupid != other_user.groupid:
        raise HTTPException(status_code=400, detail="Wybrany uzytkownik nie jest częścią grupy")
    # Pobierz grupę użytkownika
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Nie odnaleziono grupy")

    # Jeśli użytkownik jest liderem grupy, nie pozwól mu opuścić grupy
    #TO JUZ JEST SPRAWDZANE I PRZEWIDZIANE W CRUD <- zmiana jest mozliwa nawet jesli jest liderem jesli jest jedynym w groupi - patrz CRUD
    #if user.rolename == RoleEnum.leader.value:
    #    raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")

    if user.rolename != RoleEnum.leader.value:
        raise HTTPException(status_code=400, detail="Musisz być liderem, żeby móc usunąć innego użytkownika z grupy")

    # Jeśli użytkownik jest zwykłym członkiem grupy, usuń go z grupy
    try:
        CRUD.update_user_group_id(db, other_user, None)
    except exceptions.LeaderException:
        raise HTTPException(status_code=400, detail="Wybrany użytkownik nie może zostać usunięty, ponieważ jest liderem")
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=400, detail="Skład grupy z rezerwacją nie może być zmieniany")

    # Zapisz zmiany w bazie danych
    db.commit()
    return {"message": "Użytkownik opuścił grupę"}

@app.post("/Student/JoinGroup/{inviteCode}")
def join_group(inviteCode: str, student = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Makes student with user_id join a group with inviteCode
    """
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    group = CRUD.get_group_by_invite_code(db, inviteCode)
    if not group:
        raise HTTPException(status_code=404, detail="Nie istnieje grupa o podanym haśle dostępou")
    try:
        CRUD.update_user_group_id(db, student, group.groupid)
        return {"message": "Dołączono do grupy"}
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=404, detail="Skład grupy z rezerwacją nie może być zmieniany")
    except exceptions.LeaderException:
        raise HTTPException(status_code=404, detail="Jako lider nie możesz opuścić grupy")
    except exceptions.GroupSizeExccededException:
        raise HTTPException(status_code=404, detail="Grupa jest zbyt duża, aby przyjąć więcej użytkowników")
    except exceptions.MinimumSizeGroupException:
        raise HTTPException(status_code=404, detail="Grupa ma zbyt mało członków")

@app.post("/Student/CreateGroup")
def create_group(student = Depends(get_current_user), db: Session = Depends(get_db)):
    if not student:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    try:
        group=CRUD.create_project_group_short(db, student)
        return {"messsage": "Stworzono grupę. Hasło wstępu to: "+group.invitecode}
    except Exception as e:
        print (e)

@app.post("/Student/Group/GuardianAdd/{nameG}:{surname}:{email}")
def set_guardian(nameG: str, surname: str, email: str,user = Depends(get_current_user), db: Session = Depends(get_db)):
    print(nameG)
    if user is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Tylko lider może wprowadzić dane opiekuna")
    if nameG != "" and surname != "" and email != "":
        guard=schemas.GuardianCreate(
            name=nameG,
            surname=surname,
            email=email
        )
        groupid = user.groupid
        guardian = CRUD.create_guardian(db, guard)
        print(guardian.name)
        group=CRUD.update_project_group_guardian(db, groupid, guardian.guardianid)
        print(group.guardianid)
        return {"message": "Udało się dodać opiekuna"}
    raise HTTPException(status_code=404, detail="Brak wymaganych informacji na temat opiekuna")

@app.put("/Student/Group/GuardianChange/{name}/{surname}/{email}")
def change_guardian(name: str, surname: str, email: str, user = Depends(get_current_user), db: Session = Depends(get_db)):
    print(name)
    if user is None:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Tylko lider może wybrać opiekuna")
    if name != "" and surname != "" and email != "":
        guard=schemas.GuardianCreate(
            name=name,
            surname=surname,
            email=email
        )
        groupid = user.groupid
        guardian = CRUD.create_guardian(db, guard)
        print(guardian.name)
        group=CRUD.update_project_group_guardian(db, groupid, guardian.guardianid)
        print(group.guardianid)
        return {"message": "Zmieniono opiekuna"}
    raise HTTPException(status_code=404, detail="Brak wymaganych informacji na temat opiekuna")

@app.post("/Student/PDF_file")
def post_pdf_file(user = Depends(get_current_user), pdf_file: UploadFile = File(...),db:Session =Depends((get_db))):
    """
    Buduje katalog o id grupy i tam wrzuca plik ( tylko format pdf ),
    tylko lider moze to zrobic,
    status projektu nie moze byc avaliable,
    po poprawnym wgraniu pliku tworzone jest actionhistory
    """


    if not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Tylko lider może załączyć plik ze zgodą")

    reservation =CRUD.get_project_reservation_by_group(db,user.groupid)

    if reservation is None:
        raise HTTPException(status_code=404, detail="Grupa nie posiada rezerwacji")
    if reservation.status != "reserved":
        raise HTTPException(status_code=404, detail="Status projektu nie pozwala na wysłanie zgody")
    # Pobierz groupID użytkownika
    groupID = user.groupid
    # pdf_file = CRUD.validate_pdf(pdf_file)
    group = CRUD.get_group(db, groupID)
    if group.guardianid is None:
        raise HTTPException(status_code=404, detail="Grupa nie ma wybranego opiekuna. Najpierw ustaw opiekuna, a później spróbuj ponownie")
    # Określ ścieżkę, gdzie chcesz zapisać plik PDF
    save_path = os.path.join("docs", "pdf", str(groupID))

    os.makedirs(save_path, exist_ok=True)

    # Połącz ścieżkę i nazwę pliku
    file_path = os.path.join(save_path, pdf_file.filename)

    # Sprawdź, czy plik już istnieje w katalogu
    if os.path.exists(file_path):
        raise HTTPException(status_code=409,
                            detail="Plik już istnieje. Jeśli chcesz go zastąpić, proszę usuń istniejący i załaduj nowy")

    # Zapisz przesłany plik na dysku
    with open(file_path, "wb") as buffer:
        buffer.write(pdf_file.file.read())

    CRUD.update_project_reservation_files(db, reservation,file_path)
    return JSONResponse(status_code=200, content={"message": "Pomyślnie załadowano plik", "file_path": file_path})

@app.delete("/Student/PDF_file")
def delete_pdf_file(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Usuwa wszystko w katalogu o podanym id grupy,
    tylko lider moze to zrobic,
    status projektu nie moze byc avaliable,
    po poprawnym wgraniu pliku tworzone jest actionhistory
    """



    if not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Tylko lider może zarządzać plikami")

    groupID = user.groupid
    # Określ ścieżkę do katalogu, który ma zostać usunięty
    directory_path = os.path.join("docs", "pdf", str(groupID))

    # Sprawdź czy katalog istnieje
    if not os.path.exists(directory_path):
        raise HTTPException(status_code=404, detail="Nie odnaleziono folderu (ścieżki)")

    # Usuń wszystkie pliki w katalogu
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        os.remove(file_path)

    # Usuń pusty katalog
    os.rmdir(directory_path)

    reservation = CRUD.get_project_reservation_by_group(db, groupID)

    CRUD.update_project_reservation_files(db, reservation, None)
    return {"message": f"Wszystkie pliki z katalogu {user.groupid} zostały usunięte"}

@app.get("/Student/PDF_file")
def get_pdf_file(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Pobieranie pliku z katalogu grupy
    Kazdy czlonek grupy moze to zrobic
    """

    if not user:
        raise HTTPException(status_code=404, detail="Nie odnaleziono użytkownika")
    groupID = user.groupid

    # Określ ścieżkę do katalogu, z którego chcesz pobrać pliki
    directory_path = os.path.join("docs", "pdf", str(groupID))
    print(directory_path)

    # Sprawdź czy katalog istnieje
    if not os.path.exists(directory_path):
        raise HTTPException(status_code=404, detail="Nie odnaleziono folderu (ścieżki)")

    # Pobierz listę plików w katalogu
    files_list = os.listdir(directory_path)

    return {"message": f"Lista plików w katalogu {user.groupid}:", "files": files_list}

    #except Exception as e:
     #   raise HTTPException(status_code=500, detail=f"Zaszedł błąd: {str(e)}")

# Dependency to check LDAP authentication
# def check_ldap_auth(credentials: HTTPBasicCredentials = Depends(security)):
#     domain = "pwr.edu.pl"
#     if not LDAP_AUTH(domain, credentials.username, credentials.password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     return credentials.username
#
# # Example protected route using the dependency
# @app.get("/protected")
# async def protected_route(username: str = Depends(check_ldap_auth)):
#     return {"message": f"Hello, {username}! You have access to this protected route."}


# class Item(BaseModel):
#     name: str
#     price: float
#     is_offer: Union[bool, None] = None

# @app.on_event("startup")
# async def startup():
#     global ad_server
#     ad_server = Server("ad.example.com", port=389, use_ssl=False)
#
# @app.post("/login")
# async def login(request, username: str, password: str):
#     conn = Connection(ad_server, user=username, password=password)
#     if conn.bind():
#         # Store the user's username in the session
#         request.session["username"] = username
#         # Store the user's name and email in the session
#         user = conn.search(f"cn={username}", attributes=["givenName", "mail"])
#         request.session["name"] = user["givenName"]
#         request.session["email"] = user["mail"]
#         # Store the user's groups in the session
#         groups = conn.search(f"cn={username}", attributes=["memberOf"])
#         request.session["groups"] = groups["memberOf"]
#         return {"message": "Successfully authenticated"}
#     else:
#         return {"message": "Invalid username or password"}
#
# @app.get("/user")
# async def get_user(request):
#     username = request.session.get("username")
#     name = request.session.get("name")
#     email = request.session.get("email")
#     groups = request.session.get("groups")
#     return {
#         "username": username,
#         "name": name,
#         "email": email,
#         "groups": groups,
#     }

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}


@app.get("/app")
def read_main(request: Request):
    return {"message": "Hello World", "root_path": request.scope.get("root_path")}
