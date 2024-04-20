from pydantic import BaseModel
from typing import Optional


#from enum import Enum


class ProjectBase(BaseModel):
    CompanyName: str
    ProjectTitle: str
    Email: str
    PhoneNumber: str
    Description: str
    LogoPath: str = None
    Technologies: str = None
    MinGroupSize: int
    MaxGroupSize: int
    GroupNumber: int
    EnglishGroup: bool
    Remarks: str = None
    CooperationType: str = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    ProjectID: int

    class Config:
        orm_mode = True


class ProjectReservationBase(BaseModel):
    ProjectID: int
    GroupID: int
    IsConfirmed: Optional[bool]
    Status: str
    ConfirmationPath: Optional[str]


class ProjectReservationCreate(ProjectReservationBase):
    pass


class ProjectReservation(ProjectReservationBase):
    ProjectReservationID: int

    class Config:
        orm_mode = True


"""class ProjectStatus(Enum):
    available="AVAILABLE"
    reserved="RESERVED"
    taken="TAKEN"
"""


class GroupBase(BaseModel):
    GuardianID: Optional[int]
    Name: Optional[str]
    InviteCode: str
    Size: Optional[int]


class GroupCreate(GroupBase):
    pass


class Group(GroupBase):
    GroupID: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    Name: str
    Surname: str
    Email: str
    Password: str
    roleName: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    UserID: int
    GroupID: Optional[int]

    class Config:
        orm_mode = True


"""class UserRole(Enum):
    student="STUDENT"
    reserved="RESERVED"
    leader="LEADER"
"""


class GuardianBase(BaseModel):
    Name: str
    Surname: str
    Email: str


class GuardianCreate(GuardianBase):
    pass


class Guardian(GuardianBase):
    GuardianID: int

    class Config:
        orm_mode = True


class ActionHistoryBase(BaseModel):
    ReservationID: int
    DataTime: str
    Content: str
    Displayed: bool


class ActionHistoryCreate(ActionHistoryBase):
    pass


class ActionHistory(ActionHistoryBase):
    HistoryID: int

    class Config:
        orm_mode = True
