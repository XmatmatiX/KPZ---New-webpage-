# KPZ---New-webpage-

## BACKEND

Backend aplikacji Nazwa_Projektu, oparty na FastAPI, bazie danych PostgreSQL oraz bibliotece SQLAlchemy. 
Dokumentacja -> https://fastapi.tiangolo.com/tutorial/sql-databases/


### 1. Baza Danych w Docker do Testów

Uruchomienie kontenera Docker z bazą danych PostgreSQL:

```bash
docker run --name kpz-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres
```

### 2. Instalacja

```bash
pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install pandas
pip install openpyxl
```

Opcjonalnie jesli cos nie działa:

```bash
pip install python-multipart
```

### 3. Konfiguracja Bazy Danych

Po podłączeniu do bazy danych w środowisku należy:

### 4. Inicjacja Bazy Danych

W "console" wykonaj polecenia znajdujące się w pliku `backend/docs/requests.txt` w celu utworzenia schematu bazy danych.

### 5. Uruchomienie Aplikacji

Aby uruchomić aplikację, upewnij się, że jesteś w katalogu `backend`, a następnie wykonaj:

```bash
uvicorn main:app --reload
```

### 6. Testowanie Endpointów

Przejdź do przeglądarki i odwiedź adres ( jesli jestes na porcie 8000):

```
http://127.0.0.1:8000/docs
```

### Dodatkowe

- Usunięcie tabel:

```sql
DROP TABLE IF EXISTS project, projectReservation, projectGroup, users, guardian, actionhistory, "User", projectreservation, project, "Group" CASCADE;
```

- Wypełnienie bazy danych do testów:

    1. Uruchom skrypt `TextFiller.py`.
    2. Uruchom skrypt `dbFiller.py`.

## Informacje Dodatkowe

w plikach test_CRUD.py zostały przeprowadzone testy funkcji CRUD a w tests_endpoints.py testy endpointow

--- 

