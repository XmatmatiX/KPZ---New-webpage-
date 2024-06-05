from __future__ import annotations

from enum import Enum

from sqlalchemy.orm import Session
from fastapi import FastAPI, Request
from fastapi import Depends, HTTPException, status, Security, UploadFile, File

from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
# from magic import Magic
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
#from jose import JWTError, jwt
# from passlib.context import CryptContext
#from pydantic import parse_obj_as, ValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

import models, schemas, CRUD, exceptions
from database import SessionLocal, engine

from config import ALGORITHM, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ORIGINS

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", scopes={"user": "Zwykly user", "arbiter": "Arbiter"})


class RoleEnum(str, Enum):
    student = "student"
    leader = "leader"
    admin = "admin"


class ProjectStatus(str, Enum):
    available = "available"
    reserved = "reserved"


app = FastAPI(
    servers=[
        {"url": "https://projekty.kpz.pwr.edu.pl", "description": "KPZ APP by name "},
        {"url": "http://156.17.197.70", "description": "KPZ APP by IP"},

    ],
    root_path="/api/v1",
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


"""
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, name: str):
    user = CRUD.get_user(db, name)
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


# funkcja odpowiadajaca za logowanie uzytkownika
def authenticate_user(db: Session, email: str, password: str):
    user = CRUD.get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


# funkcja odpowiadajaca za autoryzacje
def get_current_user(security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        name: str = payload.get("sub")
        if name is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = schemas.TokenData(scopes=token_scopes, name=name)
    except (JWTError, ValidationError):
        raise credentials_exception
    user = get_user(db, name=token_data.name)
    if user is None:
        raise credentials_exception
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


# Endpoint rejestrujacy nowych uzytkownikow
@app.post("/register/", status_code=201)
def register(user: schemas.UserCreate, session: Session = Depends(get_db)):
    existing_user = session.query(models.Users).filter_by(name=user.name).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = get_password_hash(user.password)

    CRUD.create_user(session, user)

    return {"message": "user created successfully"}


"""
# Endpoint sluzacy do logowania. Zwraca token JWT.
# Aby uzytkownik otrzymal stopien uprawnien "user", w bazie danych musi mu byc przypisana rola o nazwie "user".
# Aby uzytkownik otrzymal stopien uprawnien "arbiter", w bazie danych musi mu byc przypisana rola o nazwie "arbiter".
"""


@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Pobieranie roli użytkownika na podstawie rolename
    user_role = user.rolename

    # Mapowanie roli użytkownika na odpowiednie zakresy (scopes)
    if user_role == RoleEnum.student.value:
        scopes = ["student"]
    elif user_role == RoleEnum.leader.value:
        scopes = ["leader"]
    elif user_role == RoleEnum.admin.value:
        scopes = ["admin"]
    else:
        # Domyślny zakres, gdy rola nie pasuje do żadnej zdefiniowanej w enumie
        scopes = ["user"]

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "scopes": scopes}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

"""


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


@app.get("/Project/{id}")
def project_detail(id: int, db: Session = Depends(get_db)):
    project = CRUD.get_project_by_id(db, id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not not found")
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
def admin_project_list(db: Session = Depends(get_db)):
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


@app.get("/Admin/Project/{id}")
def admin_project(id: int, db: Session = Depends(get_db)):
    return CRUD.get_project_by_id(db, id)
@app.get("/Admin/Reservations")
def admin_reservation(db: Session = Depends(get_db)):
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
def admin_reservation(project_id: int, db: Session = Depends(get_db)):
    """
            Zwraca dane o danej rezerwacji
    """
    reservation = CRUD.get_project_reservation_by_id(db, project_id)
    project = CRUD.get_project_by_id(db, reservation.projectid)
    return {"company": project.companyname,"id": project_id, "thema": project.projecttitle, "group":reservation.groupid,
            "state": reservation.status}

@app.get("/Admin/Group/{id}")
def admin_group(id: int, db: Session = Depends(get_db)):
    """
    Do poprawy - zawezic to co o uzytkowniku widac
    """
    group= CRUD.get_group(db, id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    members = CRUD.get_group_members(db, id)
    reservation = CRUD.get_project_reservation_by_group(db, id)
    if reservation is not None:
        project = CRUD.get_project_by_id(db, reservation.projectid)
        thema=project.projecttitle
        company= project.companyname
        status=reservation.status
    else:
        thema=None
        company=None
        status=None
    return {"id": id, "members": members, "thema": thema, "company": company,
            "state": status, "guardian": group.guardianid}

@app.get("/Admin/Groups")
def admin_groups(db: Session = Depends(get_db)):
    """
        Zwraca wszystkie grupy
    """
    groups = CRUD.get_all_groups_info(db)
    return {"groups:": groups}

@app.get("/Admin/FreeStudents")
def admin_free_students(db: Session = Depends(get_db)):
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

@app.post("/Admin/SearchStudent/{parameter}")
def search_students(parameter: str, db: Session = Depends(get_db)):
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
def get_students(db: Session = Depends(get_db)):
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
def get_student(id:int, db:Session=Depends(get_db)):
    """
            Szczegoly studenta - UWAGA ZMIANA W ZWRACANIU - zeby nie zwracac poufnych informacji

    """
    student=CRUD.get_user_by_id(db,id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")
    #return {"student":student}
    return {"name": student.name, "surname": student.surname, "email": student.email, "group": student.groupid }

@app.get("/Admin/Guardian/{id}")
def get_guardian(id:int, db: Session=Depends(get_db)):
    guardian=CRUD.get_guardian(db, id)
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return {"name": guardian.name, "surname": guardian.surname, "email": guardian.email}

@app.put("/Admin/AdminCreate/{email}")
def put_admin_create(email:str, db:Session=Depends(get_db)):
    """
    Nadanie user praw admina
    """
    student=CRUD.get_user_by_email(db,email)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")
    if student.rolename ==RoleEnum.admin.value:
        raise HTTPException(status_code=404, detail="User is alrady admin")
    if student.groupid:
        raise HTTPException(status_code=404, detail="Admin can not be assigned to a project")

    CRUD.update_to_admin(db,email)
    return {"message": " Admin changed succesfully"}

@app.get("/Admin/AdminList")
def get_admins(db: Session = Depends(get_db)):
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
def post_sign_to_group(user_id:int, groupId:int,db:Session=Depends(get_db)):
    """
            Przypisanie studenta do danej grupy.

    """
    student=CRUD.get_user_by_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")
    group= CRUD.get_group(db, groupId)

    if not group:
        raise HTTPException(status_code=404, detail="Group with such groupID doesnt exist")
    try:
        CRUD.update_user_group_id(db, student, group.groupid)
        return {"message": "Join completed succesfully"}
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=404, detail="The squad of a group with reservation can not be changed")
    except exceptions.LeaderException:
        raise HTTPException(status_code=404, detail="Leader can not change the group")
    except exceptions.GroupSizeExccededException:
        raise HTTPException(status_code=404, detail="Group is too large to have another member")
    except exceptions.MinimumSizeGroupException:
        raise HTTPException(status_code=404, detail="???")

@app.post("/Admin/AddProject")
def post_add_project(
        project:schemas.ProjectCreate,
        groupID: int =None,
        db: Session = Depends(get_db)):
    """
    Dodawanie nowego projektu przez admina
    z dodatkowa opcja przypisania do grupy
    """
    # Sprawdzanie czy wszystkie pola wymagane są uzupełnione

    try:
        CRUD.create_project(db, project)
        if groupID:
            CRUD.create_project_reservation(db,project,groupID)
        return {"message": "Project added successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to add project")


@app.get("/Admin/Notification")
def get_notifications(db: Session = Depends(get_db)):
    """
    Zwraca cala action history
    """
    all_history = CRUD.histories_whole_info(db)
    return all_history

@app.get("/Admin/Notification/{id}")
def get_notification_by_id(id: int, db: Session = Depends(get_db)):
    """
    Zwraca action history o konkretnym id - skoro to zwracamy, to automatycznie action hisotyr jest zmieniane na displayed=TRUE
    """
    notification = CRUD.get_action_history_id(db, id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not not found")
    CRUD.update_action_history_displayed(db, notification)
    return notification

@app.get("/Admin/{group_id}/Notification")
def get_group_action_history(group_id: int, db: Session = Depends(get_db)):
    """
    Zwraca cale action history konkretnej grupy  - albo pusta liste jesli nic nie ma
    """
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not not found")
    history = CRUD.get_action_history(db, group_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Action history not found")
    return history

@app.delete("/Admin/Notification/{id}")
def delete_notification_by_id(id: int, db: Session = Depends(get_db)):
    """
    Usuwa konkretne action history
    """
    action = CRUD.get_action_history_id(db, id)
    if action is None:
        return {"message": "Action doesn't exist"}
    CRUD.delete_action_history(db, action)
    return {"message": "Action deleted successfully"}


@app.delete("/Admin/{group_id}/Notification")
def delete_group_action_history(group_id: int, db: Session = Depends(get_db)):
    """
    Deletes all action history referred to a group with id
    """
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    CRUD.delete_ALL_action_history_of_one_group(db, group_id)
    return {"message": "Group's action history succesfully deleted"}

@app.delete("/Admin/database-clear")
def delete_database(db: Session = Depends(get_db)):
    """
    Deletes database -wont delete any admin!
    """
    CRUD.delete_all(db)
    return {"message": "Database succesfully deleted"}

@app.put("/Admin/AdminDelete/{id}")
def delete_admin(id: int,db: Session= Depends(get_db)):
    admin = CRUD.get_user_by_id(db, id)
    if admin is None:
        return {"message": "Such admin didn't exist"}
    CRUD.delete_user(db, admin)
    return {"message": "Admin deleted successfully"}

@app.post("/Admin/UploadProjects")
def post_uploads_projects(db: Session = Depends(get_db)):
    """
    Tworzenie projektow w bazie na podstawie zamieszczonego excel
    """
    file_path = 'docs/forms/KPZ_FORMS.xlsx'  # Dodaj ścieżkę do pliku
    projects=[]
    projects.append(CRUD.create_project_from_forms(db, file_path))
    return {"message": "Successfully submitted projects", "projects":projects}

@app.put("/Admin/Group/{group_id}/Confirm")
def confirm_realization(group_id: int, db: Session = Depends(get_db)):
    group = CRUD.get_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    if not CRUD.has_group_reservation(db, group_id):
        raise HTTPException(status_code=404, detail="Group doesnt have reservation")
    reservation = CRUD.get_project_reservation_by_group(db, group_id)
    CRUD.update_project_reservation_isConfirmed(db, reservation)
    return {"message": "The group's reservation confirmed succesfully"}

@app.delete("/Admin/DeleteProject/{id}")
def delete_project(id:int, db: Session = Depends(get_db)):
    project = CRUD.get_project_by_id(db, id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    CRUD.delete_project(db, project)
    return {"message": "Project deleted successfully"}

@app.put("/Admin/{project_id}/Logo")
def put_logo(project_id: str, logo_file:UploadFile=File(...),db: Session = Depends(get_db) ):
    """
    Dodawanie loga firmy przez podanie nazwy firmy.
    Dodanie pliku oznacza nadpisanie poprzedniego. Sciezka pliku zapisuje sie w project.logopath
    """
    try:
        project = CRUD.get_project_by_id(db, project_id)

        save_path = os.path.join("docs", "logo", str(project.companyname))
        os.makedirs(save_path, exist_ok=True)

        # Sprawdź, czy istnieje już plik logo firmy
        existing_logo_path = os.path.join(save_path, str(project.logopath))
        if os.path.exists(existing_logo_path):
            os.remove(existing_logo_path)

        file_path = os.path.join(save_path, logo_file.filename)
        CRUD.update_project_logopath(db,project, str(file_path))

        # Zapisz przesłany plik na dysku
        with open(file_path, "wb") as buffer:
            buffer.write(logo_file.file.read())

        return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "file_path": file_path})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "An error occurred", "error": str(e)})

@app.post("/Admin/ExcelFile")
def post_excel(excel_file: UploadFile = File(...),db: Session = Depends(get_db)):
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
                                detail="File already exists. If you want to replace it, please delete and upload a new one.")

        # Zapisz przesłany plik na dysku
        with open(file_path, "wb") as buffer:
            buffer.write(excel_file.file.read())

        return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "file_path": file_path})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "An error occurred", "error": str(e)})

@app.delete("/Admin/ExcelFile")
def delete_excel(db: Session = Depends(get_db)):
    """
    Usuwanie pliku excel
    """
    try:
        directory_path = os.path.join("docs", "forms")

        # Sprawdź czy katalog istnieje
        if not os.path.exists(directory_path):
            raise HTTPException(status_code=404, detail="Directory not found")

        # Usuń wszystkie pliki w katalogu
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            os.remove(file_path)

        # Usuń pusty katalog
        os.rmdir(directory_path)

        return {"message": f"All files in directory deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/Admin/setTime/{year}:{month}:{day}:{hour}:{minute}:{second}")
def set_time_subscribtion(year:int, month:int, day:int, hour:int, minute:int, second:int, db: Session = Depends(get_db)):
    data=f"{day}.{month}.{year} {hour}:{minute}:{second}"
    CRUD.setTimeOfSubscribtion(data)
    return {"message": f"ustawiono czas rezerwacji na {data}"}


########### SEKCJA STUDENT ################

@app.get("/Student/Group/{id}")
def get_student_group(id: int, db: Session = Depends(get_db)):
    """
    Returns information about a group to which student with id belong
    id jest studenta!
    """
    # Get the student by their id
    student = CRUD.get_user_by_id(db, id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get the group of the student
    group = CRUD.get_group(db, student.groupid)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

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
            "name": member.name,
            "surname": member.surname,
            "role": member.rolename
        })

    # Return the group information along with student details
    return {
        "contact_info": contact_info,
        "guardian_info": guardian_info,
        "members": member_details,
        "invite_code": group.invitecode,
        "group_size": group.groupsize,
        "reservation-status": status,
        "project-info":project_info,
    }

@app.put("/Student/ChangeLeader/{id}")
def put_change_leader(id: int, db: Session = Depends(get_db)):
    """
    Change leader of a group <- the ID is of a new leader
    """
    user = CRUD.get_user_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

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

    return {"message": "Leader changed successfully"}

@app.post("/Student/{user_id}/Enroll/{project_id}")
def enroll_student_to_project( user_id: int, project_id: int, db: Session = Depends(get_db)):
    """
    Makes reseravtion of a project - should be done by leader otherwise raise exception
    """
    # Sprawdź, czy użytkownik istnieje
    user = CRUD.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Sprawdź, czy użytkownik ma rolę lidera
    if user.rolename != "leader":
        raise HTTPException(status_code=403, detail="You must be a leader to enroll in a project")

    # Sprawdź, czy projekt istnieje
    project = CRUD.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    group = CRUD.get_group(db, user.groupid)
    if CRUD.has_group_reservation(db, group.groupid):
        raise HTTPException(status_code=404, detail="You already have reservation!")
    try:
        # Spróbuj utworzyć rezerwację projektu
        new_reservation = CRUD.create_project_reservation(db, project, group)
    except exceptions.NotTimeForReservationException:
        raise HTTPException(status_code=400, detail="Project cannot be reserved at the moment")
    except exceptions.ProjectNotAvailableException:
        raise HTTPException(status_code=400, detail="Project is already reserved")
    except exceptions.GroupSizeNotValidForProjectException:
        raise HTTPException(status_code=400, detail="Group size doesnt meet requirements")

    return {"message": "Enrollment successful", "group_id": user.groupid, "project_name": project.projecttitle}

@app.delete("/Student/{user_id}/QuitProject")
def delete_reservation(user_id: int, db: Session = Depends(get_db)):
    """
    Rezegnacja grupy projektowej z rezerwacji projekt. Użytkownik musi byc liderem.
    """
    user = CRUD.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.groupid is None:
        raise HTTPException(status_code=404, detail="User is not in any group")
    if user.rolename != "leader":
        raise HTTPException(status_code=403, detail="You must be a leader to delete reservation")
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if not CRUD.has_group_reservation(db, user.groupid):
        raise HTTPException(status_code=404, detail="Reservation not found")
    reservation = CRUD.get_project_reservation_by_group(db, group.groupid)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    CRUD.delete_project_reservation(db,reservation)
    return {"message": "Reservation deleted successfully"}

@app.post("/Student/unsubscribe/{id}")
def unsubscribe_from_group(id: int, db: Session = Depends(get_db)):
    """
    Opuszczenie grupy projektowej. Lider nie może opuścić grupy, chyba że jest jedynym jej członkiem.
    W takim przypadku grupa zostanie usunięta
    """
    # Pobierz użytkownika
    user = CRUD.get_user_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Sprawdź, czy użytkownik należy do jakiejkolwiek grupy
    if not user.groupid:
        raise HTTPException(status_code=400, detail="User is not in any group")

    # Pobierz grupę użytkownika
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Jeśli użytkownik jest liderem grupy, nie pozwól mu opuścić grupy
    #TO JUZ JEST SPRAWDZANE I PRZEWIDZIANE W CRUD <- zmiana jest mozliwa nawet jesli jest liderem jesli jest jedynym w groupi - patrz CRUD
    #if user.rolename == RoleEnum.leader.value:
    #    raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")

    # Jeśli użytkownik jest zwykłym członkiem grupy, usuń go z grupy
    try:
        CRUD.update_user_group_id(db, user, None)
    except exceptions.LeaderException:
        raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=400, detail="You cannot leave the group which has reservation")

    # Zapisz zmiany w bazie danych
    db.commit()

    return {"message": "User unsubscribed from the group successfully"}

@app.post("/Student/{my_id}/unsubscribeSomeone/{someone_id}")
def unsubscribe_from_group(my_id: int, someone_id: int,  db: Session = Depends(get_db)):
    """
       Usuwanie członka grupy. Tylko Lider może usunąć członka grupy.
    """
    # Pobierz użytkownika
    user = CRUD.get_user_by_id(db, my_id)
    other_user = CRUD.get_user_by_id(db, someone_id)
    if not other_user or not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Sprawdź, czy użytkownik należy do jakiejkolwiek grupy
    if not user.groupid or  not other_user.groupid:
        raise HTTPException(status_code=400, detail="User is not in any group")
    if user.groupid != other_user.groupid:
        raise HTTPException(status_code=400, detail="The other user is not in your group")
    # Pobierz grupę użytkownika
    group = CRUD.get_group(db, user.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Jeśli użytkownik jest liderem grupy, nie pozwól mu opuścić grupy
    #TO JUZ JEST SPRAWDZANE I PRZEWIDZIANE W CRUD <- zmiana jest mozliwa nawet jesli jest liderem jesli jest jedynym w groupi - patrz CRUD
    #if user.rolename == RoleEnum.leader.value:
    #    raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")

    if user.rolename != RoleEnum.leader.value:
        raise HTTPException(status_code=400, detail="You must be a leader to delete other students from group")

    # Jeśli użytkownik jest zwykłym członkiem grupy, usuń go z grupy
    try:
        CRUD.update_user_group_id(db, other_user, None)
    except exceptions.LeaderException:
        raise HTTPException(status_code=400, detail="Chosen student cannot leave the group because of being the leader")
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=400, detail="the group with reservation can not change quad")

    # Zapisz zmiany w bazie danych
    db.commit()
    return {"message": "User unsubscribed from the group successfully"}

@app.post("/Student/{user_id}/JoinGroup/{inviteCode}")
def join_group(user_id: int, inviteCode: str, db: Session = Depends(get_db)):
    """
    Makes student with user_id join a group with inviteCode
    """
    student = CRUD.get_user_by_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")
    group = CRUD.get_group_by_invite_code(db, inviteCode)
    if not group:
        raise HTTPException(status_code=404, detail="Group with such inviteCode doesnt exist")
    try:
        CRUD.update_user_group_id(db, student, group.groupid)
        return {"message": "Join completed succesfully"}
    except exceptions.GroupWithReservation:
        raise HTTPException(status_code=404, detail="The squad of a group with reservation can not be changed")
    except exceptions.LeaderException:
        raise HTTPException(status_code=404, detail="Leader can not change the group")
    except exceptions.GroupSizeExccededException:
        raise HTTPException(status_code=404, detail="Group is too large to have another member")
    except exceptions.MinimumSizeGroupException:
        raise HTTPException(status_code=404, detail="???")

@app.post("/Student/{user_id}/CreateGroup")
def create_group(user_id: int, db: Session = Depends(get_db)):
    student = CRUD.get_user_by_id(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        group=CRUD.create_project_group_short(db, student)
        return {"messsage": "the group was succesfully created, here is its inviteCode"+group.invitecode}
    except Exception as e:
        print (e)

@app.post("/Student/{user_id}/Group/GuardianAdd/{name}/{surname}/{email}")
def set_guardian(user_id: int, name: str, surname: str, email: str, db: Session = Depends(get_db)):
    user = CRUD.get_user_by_id(db, user_id)
    print(name)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Only leader can select guardian")
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
        return {"message": "The guardian of group was changed successfully"}
    raise HTTPException(status_code=404, detail="Lack of required information")

@app.put("/Student/{user_id}/Group/GuardianChange/{name}/{surname}/{email}")
def change_guardian(user_id: int, name: str, surname: str, email: str, db: Session = Depends(get_db)):
    user = CRUD.get_user_by_id(db, user_id)
    print(name)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.rolename != "leader":
        raise HTTPException(status_code=404, detail="Only leader can select guardian")
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
        return {"message": "The guardian of group was changed successfully"}
    raise HTTPException(status_code=404, detail="Lack of required information")

@app.post("/Student/{user_id}/PDF_file")
def post_pdf_file(user_id: int,pdf_file: UploadFile = File(...),db:Session =Depends((get_db))):
    """
    Buduje katalog o id grupy i tam wrzuca plik ( tylko format pdf ),
    tylko lider moze to zrobic,
    status projektu nie moze byc avaliable,
    po poprawnym wgraniu pliku tworzone jest actionhistory
    """
    try:
        # Pobierz użytkownika na podstawie jego ID
        user = CRUD.get_user_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.rolename != "leader":
            raise HTTPException(status_code=404, detail="Only leader can upload files")

        reservation =CRUD.get_project_reservation_by_group(db,user.groupid)

        if reservation is None:
            raise HTTPException(status_code=404, detail="This group doesnt have reservation")
        if reservation == "available":
            raise HTTPException(status_code=404, detail="Project status is not available")
        # Pobierz groupID użytkownika
        groupID = user.groupid
        # pdf_file = CRUD.validate_pdf(pdf_file)

        # Określ ścieżkę, gdzie chcesz zapisać plik PDF
        save_path = os.path.join("docs", "pdf", str(groupID))

        os.makedirs(save_path, exist_ok=True)

        # Połącz ścieżkę i nazwę pliku
        file_path = os.path.join(save_path, pdf_file.filename)

        # Sprawdź, czy plik już istnieje w katalogu
        if os.path.exists(file_path):
            raise HTTPException(status_code=409,
                                detail="File already exists. If you want to replace it, please delete and upload a new one.")

        # Zapisz przesłany plik na dysku
        with open(file_path, "wb") as buffer:
            buffer.write(pdf_file.file.read())

        CRUD.create_action_history(db, groupID,"File uploaded successfully")
        return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "file_path": file_path})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "An error occurred", "error": str(e)})
@app.delete("/Student/{user_id}/PDF_file")
def delete_pdf_file(user_id: int, db: Session = Depends(get_db)):
    """
    Usuwa wszystko w katalogu o podanym id grupy,
    tylko lider moze to zrobic,
    status projektu nie moze byc avaliable,
    po poprawnym wgraniu pliku tworzone jest actionhistory
    """
    try:

        # Pobierz użytkownika na podstawie jego ID
        user = CRUD.get_user_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.rolename != "leader":
            raise HTTPException(status_code=404, detail="Only leader can upload files")

        groupID = user.groupid
        # Określ ścieżkę do katalogu, który ma zostać usunięty
        directory_path = os.path.join("docs", "pdf", str(groupID))

        # Sprawdź czy katalog istnieje
        if not os.path.exists(directory_path):
            raise HTTPException(status_code=404, detail="Directory not found")

        # Usuń wszystkie pliki w katalogu
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            os.remove(file_path)

        # Usuń pusty katalog
        os.rmdir(directory_path)

        CRUD.create_action_history(db, groupID,"File deleted successfully")
        return {"message": f"All files in directory {user.groupid} deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
@app.get("/Student/{user_id}/PDF_file")
def get_pdf_file(user_id: int, db: Session = Depends(get_db)):
    """
    Pobieranie pliku z katalogu grupy
    Kazdy czlonek grupy moze to zrobic
    """
    try:
        user = CRUD.get_user_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        groupID = user.groupid

        # Określ ścieżkę do katalogu, z którego chcesz pobrać pliki
        directory_path = os.path.join("docs", "pdf", str(groupID))

        # Sprawdź czy katalog istnieje
        if not os.path.exists(directory_path):
            raise HTTPException(status_code=404, detail="Directory not found")

        # Pobierz listę plików w katalogu
        files_list = os.listdir(directory_path)

        return {"message": f"List of files in directory {user.groupid}:", "files": files_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

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
