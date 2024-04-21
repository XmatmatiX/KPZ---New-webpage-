# from enums import RoleEnum

from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
# definiowanie modeli danych w SQLAlchemy
# mapujemy obiekty Python na rekordy w bazie danych

class Project(Base):
    __tablename__ = 'project'
    projectid = Column(Integer, primary_key=True,  autoincrement=True)
    companyname = Column(String(50), nullable=False)
    projecttitle = Column(String(255), nullable=False)
    email = Column(String(50), nullable=False)
    phoneNumber = Column(String(15), nullable=False)
    description = Column(Text, nullable=False)
    logopath = Column(String(255))
    technologies = Column(Text)
    mingroupsize = Column(Integer, nullable=False)
    maxgroupsize = Column(Integer, nullable=False)
    groupnumber = Column(Integer, nullable=False)
    englishgroup = Column(Boolean)
    remarks = Column(Text)
    cooperationtype = Column(Text)

    reservations = relationship("ProjectReservation", back_populates="project")

class ProjectReservation(Base):
    __tablename__ = 'projectReservation'
    projectreservationid = Column(Integer, primary_key=True,  autoincrement=True)
    projectid = Column(Integer, ForeignKey('project.projectid'), nullable=False)
    groupid = Column(Integer, ForeignKey('projectGroup.groupid'), nullable=False)
    isconfirmed = Column(Boolean)
    status = Column(String(25), nullable=False)
    confirmationpath = Column(String(255))

    project = relationship("Project", back_populates="reservations")
    projectGroup = relationship("ProjectGroup", back_populates="reservations")
    history = relationship("ActionHistory", back_populates="reservation")

class ProjectGroup(Base):
    __tablename__ = 'projectGroup'
    groupid = Column(Integer, primary_key=True,  autoincrement=True)
    guardianid = Column(Integer, ForeignKey('guardian.guardianid'))
    name = Column(String(50))
    invitecode = Column(String(10), nullable=False)
    groupsize = Column(Integer)

    guardian = relationship("Guardian", back_populates="projectGroup")
    reservations = relationship("ProjectReservation", back_populates="projectGroup")
    users = relationship("Users", back_populates="projectGroup")



class Users(Base):
    __tablename__ = 'users'
    userid = Column(Integer, primary_key=True,  autoincrement=True)
    groupid = Column(Integer, ForeignKey('projectGroup.groupid'), autoincrement=True)  #dodalam nullable=True
    name = Column(String(25), nullable=False)
    surname = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False)
    password = Column(String(64), nullable=False) #do zmiany potem !!!!!
    rolename = Column(String(25), nullable=False)

    projectGroup = relationship("ProjectGroup", back_populates="users")


class Guardian(Base):
    __tablename__ = 'guardian'
    guardianid = Column(Integer, primary_key=True,  autoincrement=True)
    name = Column(String(25), nullable=False)
    surname = Column(String(50), nullable=False)
    email = Column(String(50), nullable=False)

    projectGroup = relationship("ProjectGroup", back_populates='guardian')


class ActionHistory(Base):
    __tablename__ = 'actionHistory'
    historyid = Column(Integer, primary_key=True,  autoincrement=True)
    reservationid = Column(Integer, ForeignKey('projectReservation.projectreservationid'), nullable=False)
    datatime = Column(DateTime, nullable=False)
    content = Column(Text, nullable=False)
    displayed = Column(Boolean, nullable=False)

    reservation = relationship("ProjectReservation", back_populates="history")
