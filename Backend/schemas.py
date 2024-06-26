from pydantic import BaseModel
from typing import Optional


#from enum import Enum

# tu tworzymy moedel w pydantic, ktore sa wykorzytsywane
# do walidacji danych przychodzacych i wychodzacych z endpointow

class ProjectBase(BaseModel):
    companyname: str
    projecttitle: str
    email: str
    phonenumber: str
    description: str
    logopath: Optional[str] = None
    technologies: Optional[str] = None
    mingroupsize: int
    maxgroupsize: int
    groupnumber: int
    englishgroup: str
    remarks: str = None
    cooperationtype: Optional[str] = None
    person: str


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    projectid: int

    class Config:
        orm_mode = True


class ProjectReservationBase(BaseModel):
    projectid: int
    groupid: int
    status: str = None
    confirmationpath: Optional[str] = None


class ProjectReservationCreate(ProjectReservationBase):
    pass

class ProjectReservationUpdate(ProjectReservationBase):
    pass


class ProjectReservationReturn(ProjectReservationBase):
    projectreservationid: int

    class Config:
        orm_mode = True


"""class ProjectStatus(Enum):
    available="AVAILABLE"
    reserved="RESERVED"
    taken="TAKEN"
"""


class ProjectGroupBase(BaseModel):
    guardianid: int = None
    invitecode: str = None
    groupsize: int = None


class ProjectGroupCreate(ProjectGroupBase):
    pass


class ProjectGroupReturn(ProjectGroupBase):
    groupid: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    name: str
    surname: str
    email: str
    # Password: str
    rolename: str ='student'

# trzymamy haslo tutaj zeby np nie bylo dostepne podczas pobierania danych z bazy
class UserCreate(UserBase):
    keycloackid: str
    pass


class UserReturn(UserBase):
    userid: int
    groupid: int

    class Config:
        orm_mode = True

"""class UserRole(Enum):
    student="STUDENT"
    reserved="RESERVED"
    leader="LEADER"
"""


class GuardianBase(BaseModel):
    name: str
    surname: str
    email: str


class GuardianCreate(GuardianBase):
    pass


class GuardianReturn(GuardianBase):
    guardianid: int

    class Config:
        orm_mode = True


class ActionHistoryBase(BaseModel):
    # reservationid: int
    groupid: int
    datatime: str
    content: str
    displayed: bool


class ActionHistoryCreate(ActionHistoryBase):
    pass


class ActionHistoryReturn(ActionHistoryBase):
    historyid: int

    class Config:
        orm_mode = True

# modele danych używane w  aplikacji
# do reprezentowania tokenów uwierzytelniających i danych tokenów
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: str | None = None
    scopes: list[str] = []
