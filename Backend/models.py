from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Project(Base):
    __tablename__ = 'Project'
    ProjectID = Column(Integer, primary_key=True,  autoincrement=True)
    CompanyName = Column(String(50), nullable=False)
    ProjectTitle = Column(String(255), nullable=False)
    Email = Column(String(50), nullable=False)
    PhoneNumber = Column(String(15), nullable=False)
    Description = Column(Text, nullable=False)
    LogoPath = Column(String(255))
    Technologies = Column(Text)
    MinGroupSize = Column(Integer, nullable=False)
    MaxGroupSize = Column(Integer, nullable=False)
    GroupNumber = Column(Integer, nullable=False)
    EnglishGroup = Column(Boolean)
    Remarks = Column(Text)
    CooperationType = Column(Text)


class ProjectReservation(Base):
    __tablename__ = 'ProjectReservation'
    ProjectReservationID = Column(Integer, primary_key=True,  autoincrement=True)
    ProjectID = Column(Integer, ForeignKey('Project.ProjectID'), nullable=False)
    GroupID = Column(Integer, ForeignKey('Group.GroupID'), nullable=False)
    IsConfirmed = Column(Boolean)
    Status = Column(String(25), nullable=False)
    ConfirmationPath = Column(String(255))


class Group(Base):
    __tablename__ = 'Group'
    GroupID = Column(Integer, primary_key=True,  autoincrement=True)
    GuardianID = Column(Integer, ForeignKey('Guardian.GuardianID'))
    Name = Column(String(50))
    InviteCode = Column(String(10), nullable=False)
    Size = Column(Integer)

    guardian = relationship("Guardian")


class User(Base):
    __tablename__ = 'User'
    UserID = Column(Integer, primary_key=True,  autoincrement=True)
    GroupID = Column(Integer, ForeignKey('Group.GroupID'))
    Name = Column(String(25), nullable=False)
    Surname = Column(String(50), nullable=False)
    Email = Column(String(50), nullable=False)
    Password = Column(String(255), nullable=False)
    roleName = Column(String(25), nullable=False)


class Guardian(Base):
    __tablename__ = 'Guardian'
    GuardianID = Column(Integer, primary_key=True,  autoincrement=True)
    Name = Column(String(25), nullable=False)
    Surname = Column(String(50), nullable=False)
    Email = Column(String(50), nullable=False)


class ActionHistory(Base):
    __tablename__ = 'ActionHistory'
    HistoryID = Column(Integer, primary_key=True,  autoincrement=True)
    ReservationID = Column(Integer, ForeignKey('ProjectReservation.ProjectReservationID'), nullable=False)
    DataTime = Column(DateTime, nullable=False)
    Content = Column(Text, nullable=False)
    Displayed = Column(Boolean, nullable=False)
