from __future__ import annotations

from datetime import datetime, timedelta
import random
import time
from enum import Enum

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
#from jose import JWTError, jwt
from passlib.context import CryptContext
#from pydantic import parse_obj_as, ValidationError
from fastapi.middleware.cors import CORSMiddleware

import models, schemas, CRUD
from database import SessionLocal, engine

from config import ALGORITHM, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ORIGINS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", scopes={"user": "Zwykly user", "arbiter": "Arbiter"})


class RoleEnum(str, Enum):
    student = "student"
    leader = "leader"
    admin = "admin"


class ProjectStatus(str, Enum):
    available = "available"
    reserved = "reserved"


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return {"projects:": projects}

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

########### SEKCJA ADMIN ################
@app.get("/Admin/ProjectList")
def admin_project_list(db: Session = Depends(get_db)):
    projects = CRUD.get_all_projects(db)
    logos = []
    companynames = []
    titles = []
    pid = []
    minsizes = []
    maxsizes = []
    stats = []
    groups = []
    for project in projects:
        n = CRUD.number_project_reserved(db, project.projectid)
        groups_project = CRUD.get_groups_assigned_to_projects(db, project)
        for i in range(project.groupnumber):
            logos.append(project.logopath)
            companynames.append(project.companyname)
            titles.append(project.projecttitle)
            pid.append(project.projectid)
            minsizes.append(project.mingroupsize)
            maxsizes.append(project.maxgroupsize)
            if i < n:
                stats.append(ProjectStatus.reserved)
                groups.append(groups_project[i])
            else:
                stats.append(ProjectStatus.available)
                groups.append(None)
    return {"logos": logos, "companynames": companynames, "titles": titles, "projecstid": pid, "minsizes": minsizes,
            "maxsizes": maxsizes, "status": stats, "group": groups}


@app.get("/Admin/Project/{id}")
def admin_project(id: int, db: Session = Depends(get_db)):
    return CRUD.get_project_by_id(db, id)


@app.get("/Admin/Group/{id}")
def admin_group(id: int, db: Session = Depends(get_db)):
    """
    Do poprawy - zawezic to co o uzytkowniku widac
    """
    members = CRUD.get_group_members(db, id)
    reservation = CRUD.get_project_reservation_by_group(db, id)
    project = CRUD.get_project_by_id(db, reservation.projectid)
    return {"id": id, "members": members, "thema": project.projecttitle, "company": project.companyname,
            "state": reservation.status}

@app.get("/Admin/Groups")
def admin_groups(db: Session = Depends(get_db)):
    groups = CRUD.get_all_groups(db)
    return {"groups:": groups}

    id = []
    guardian = []
    invitecode = []
    size = []

    for group in groups:
        # Dodawanie atrybutów do odpowiednich list
        group_ids.append(group.groupid)
        group_guardians.append(group.guardianid)
        group_invitecodes.append(group.invitecode)
        group_sizes.append(group.groupsize)

    # Zwracanie wyniku jako słownik
    return {
        "id": group_ids,
        "guardian": group_guardians,
        "invitecode": group_invitecodes,
        "size": group_sizes
    }
@app.get("/Admin/FreeStudents")
def admin_free_students(db: Session = Depends(get_db)):
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



########### SEKCJA STUDENT ################

@app.get("/Student/Group/{id}")
def get_student_group(student_id: int, db: Session = Depends(get_db)):
    # Get the student by their id
    student = CRUD.get_user_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Get the group of the student
    group = CRUD.get_group(db, student.groupid)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Initialize lists for member details
    member_details = []

    # Get group members
    members = CRUD.get_group_members(db, group.groupid)

    # Check if the project is reserved
    reservation = CRUD.get_project_reservation_by_group(db, group.groupid)
    if reservation:
        # Project is reserved, get contact information
        contact_info = {
            "company": reservation.project.companyname,
            "contact_email": reservation.project.email,
            "contact_phone": reservation.project.phonenumber
        }
    else:
        # Project is not reserved, set contact information to null
        contact_info = {
            "company": None,
            "contact_email": None,
            "contact_phone": None
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
        "group_size": group.groupsize
    }

@app.put("/Student/ChangeLeader/{id}")
def put_change_leader(user_id: int, db: Session = Depends(get_db)):
    user = CRUD.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Sprawdź, czy użytkownik jest liderem
    if user.rolename != RoleEnum.leader.value:
        # Jeśli użytkownik nie jest liderem, zmień jego status na studenta
        user.rolename = RoleEnum.student.value

        # Znajdź aktualnego lidera i zmień jego status na studenta
        current_leader = CRUD.get_current_leader(db)
        if current_leader:
            current_leader.rolename = RoleEnum.student.value

        # Przypisz wybranego użytkownika jako lidera
        user.rolename = RoleEnum.leader.value

        # Zapisz zmiany w bazie danych
        db.commit()

    return {"message": "Leader changed successfully"}
# NIE DZIALA JESZCZE
@app.post("/Student/Enroll/{id}")
def enroll_student_to_project(project_id: int, user_id: int, db: Session = Depends(get_db)):
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

    # Stwórz nową rezerwację projektu
    reservation = schemas.ProjectReservationCreate(projectid=project_id, groupid=user.groupid)

    try:
        # Spróbuj utworzyć rezerwację projektu
        new_reservation = CRUD.create_project_reservation(db, reservation)
    except exceptions.ProjectNotAvailableException:
        raise HTTPException(status_code=400, detail="Project cannot be reserved at the moment")

    return {"message": "Enrollment successful", "group_id": user.groupid, "project_id": project_id}

@app.post("/Student/unsubscribe/{id}")
def unsubscribe_from_group(user_id: int, db: Session = Depends(get_db)):
    # Pobierz użytkownika
    user = CRUD.get_user_by_id(db, user_id)
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
    if user.rolename == RoleEnum.leader.value:
        raise HTTPException(status_code=400, detail="You cannot leave the group because you are the leader")

    # Jeśli użytkownik jest zwykłym członkiem grupy, usuń go z grupy
    CRUD.remove_user_from_group(db, user_id)

    # Zapisz zmiany w bazie danych
    db.commit()

    return {"message": "User unsubscribed from the group successfully"}

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

@app.get("/")
def read_root():
    return {"Hello": "World"}


