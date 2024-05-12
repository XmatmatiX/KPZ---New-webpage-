from __future__ import annotations

from datetime import datetime, timedelta
import random
import time
from enum import Enum

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
#from jose import JWTError, jwt
# from passlib.context import CryptContext
#from pydantic import parse_obj_as, ValidationError
from fastapi.middleware.cors import CORSMiddleware

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
    # return {"projects:": projects}

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
def project_detail(project_id: int, db: Session = Depends(get_db)):
    project = CRUD.get_project_by_id(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not not found")
    num_taken = CRUD.number_project_reserved(db, project.projectid)
    return {"id": project_id, "logo": project.logopath ,"companyname": project.companyname, "title": project.projecttitle,
            "description": project.description, "technologies": project.technologies, "minsize": project.mingroupsize, "maxsize": project.maxgroupsize,
            "groupnumber": project.groupnumber, "remarks": project.remarks, "cooperationtype": project.cooperationtype,
            "numertaken": num_taken}

########### SEKCJA ADMIN ################
@app.get("/Admin/ProjectList")
def admin_project_list(db: Session = Depends(get_db)):
    projects = CRUD.get_all_projects(db)
    return {"projects:": projects}
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
    members = CRUD.get_group_members(db, id)
    reservation = CRUD.get_project_reservation_by_group(db, id)
    project = CRUD.get_project_by_id(db, reservation.projectid)
    return {"id": id, "members": members, "thema": project.projecttitle, "company": project.companyname,
            "state": reservation.status}

@app.get("/Admin/Groups")
def admin_groups(db: Session = Depends(get_db)):
    """
        Zwraca wszystkie grupy
    """
    groups = CRUD.get_all_groups(db)
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

@app.get("/Admin/Student/{id}")
def get_student(id:int, db:Session=Depends(get_db)):
    """
            Szczegoly studenta

    """
    student=CRUD.get_user_by_id(db,id)
    if not student:
        raise HTTPException(status_code=404, detail="User not found")

    return {"student": student }
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



@app.get("/Admin/Notification")
def get_notifications(db: Session = Depends(get_db)):
    """
    Zwraca cala action history
    """
    all_history = CRUD.get_all_history(db)
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
def delete_notification_by_id(notificaton_id: int, db: Session = Depends(get_db)):
    """
    Usuwa konkretne action history
    """
    action = CRUD.get_action_history_id(db, notificaton_id)
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
    Deletes database
    """
    CRUD.delete_all(db)
    return {"message": "Database succesfully deleted"}


########### SEKCJA STUDENT ################

@app.get("/Student/Group/{id}")
def get_student_group(student_id: int, db: Session = Depends(get_db)):
    """
    Returns information about a group to which student with id belong
    """
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
    """
    Change leader of a group <- the ID is of a new leader
    """
    user = CRUD.get_user_by_id(db, user_id)
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
    try:
        # Spróbuj utworzyć rezerwację projektu
        new_reservation = CRUD.create_project_reservation(db, project, group)
    except exceptions.ProjectNotAvailableException:
        raise HTTPException(status_code=400, detail="Project cannot be reserved at the moment")
    except exceptions.GroupSizeNotValidForProjectException:
        raise HTTPException(status_code=400, detail="Group size doesnt meet requirements")

    return {"message": "Enrollment successful", "group_id": user.groupid, "project_name": project.projecttitle}

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


