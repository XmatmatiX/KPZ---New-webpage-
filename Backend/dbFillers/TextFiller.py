import random

names=['Anna', 'Karol', 'Genofewa', 'Radoslaw', 'Laura', 'Edek', 'Jan', 'Maria']
surnames=['Kowalski', 'Nowak', 'Zarowka', 'Niebieski']
email_end='@example.com'
keycloakid=['123', 'haslo']
rolename='student'

def randomUsers():
    file = open('users.txt', 'w')
    for i in range(20):
        name = random.choice(names)
        surname = random.choice(surnames)
        password = random.choice(keycloakid)
        email = name.lower() + '.' + surname.lower() + email_end
        file.write(name+" "+surname+" "+email+" "+password+" student\n")
    name = random.choice(names)
    surname = random.choice(surnames)
    password = random.choice(keycloakid)
    email = name.lower() + '.' + surname.lower() + email_end
    file.write(name+" "+surname+" "+email+" "+password+" admin\n")
    file.close()

def randomGuardian():
    file = open('guardians.txt', 'w')
    for i in range(5):
        name = random.choice(names)
        surname = random.choice(surnames)
        email = name.lower() + '.' + surname.lower() + email_end
        file.write(name + " " + surname + " " + email +"\n")
    file.close()

randomUsers()
randomGuardian()