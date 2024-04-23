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
    logopath: str= None
    technologies: str = None
    mingroupsize: int
    maxgroupsize: int
    groupnumber: int
    englishgroup: bool
    remarks: str = None
    cooperationtype: str = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    projectid: int

    class Config:
        orm_mode = True


class ProjectReservationBase(BaseModel):
    projectid: int
    groupid: int
    isconfirmed: bool =None
    status: str =None
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
    guardianid: Optional[int]
    name: Optional[str]
    invitecode: str
    groupsize: Optional[int]


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
    rolename: str

# trzymamy haslo tutaj zeby np nie bylo dostepne podczas pobierania danych z bazy
class UserCreate(UserBase):
    password: str
    # pass


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
    reservationid: int
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
