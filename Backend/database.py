from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import LOCAL_URL

# SQLALCHEMY_DATABASE_URL = "postgresql:///./kpz.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"
# SQLALCHEMY_DATABASE_URL ="postgresql://nazwa_uzytkownika:haslo@localhost:5432/nazwa_bazy"
engine = create_engine(
    LOCAL_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()