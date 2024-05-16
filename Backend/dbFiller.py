from Backend import CRUD, models
from Backend import schemas
from database import SessionLocal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def fill_database():
    """
    Wypelnianie bazy testowymi danymi z dbFillers
    :return:
    """
    db = SessionLocal()
    CRUD.delete_all(db)

    users = readUsers(db)
    guards = readGuardians(db)
    projects = readProjects(db)
    group = CRUD.create_project_group_short(db, users[0])
    CRUD.update_user_group_id(db, users[5], group.groupid)
    CRUD.update_user_group_id(db, users[15], group.groupid)
    CRUD.update_user_group_id(db, users[17], group.groupid)
    CRUD.update_project_group_guardian(db, group.groupid,guards[2].guardianid)
    CRUD.create_project_reservation(db, projects[0], group)

    group = CRUD.create_project_group_short(db, users[4])
    CRUD.update_user_group_id(db, users[6], group.groupid)
    CRUD.update_user_group_id(db, users[10], group.groupid)
    CRUD.update_project_group_guardian(db, group.groupid,guards[0].guardianid)
    CRUD.create_project_reservation(db, projects[1], group)








def readUsers(db: SessionLocal):
    file = open('dbFillers/users.txt', 'r')
    created_users = []
    Lines = file.readlines()
    for line in Lines:
        vals = line.split(' ')
        name = vals[0]
        surname = vals[1]
        email = vals[2]
        #password = vals[3]
        role = vals[4]
        user = schemas.UserCreate(
            name=name,
            surname=surname,
            email=email,
            keycloackid="password",
            rolename="student"
        )
        created_users.append(CRUD.create_user(db, user))
    return created_users

def readGuardians(db: SessionLocal):
    file = open('dbFillers/guardians.txt', 'r')
    created_guardians=[]
    Lines = file.readlines()
    for line in Lines:
        vals = line.split(' ')
        name = vals[0]
        surname = vals[1]
        email = vals[2]
        guard = schemas.GuardianCreate(
            name=name,
            surname=surname,
            email=email,
        )
        created_guardians.append(CRUD.create_guardian(db, guard))
    return created_guardians

def readProjects(db:SessionLocal):
    """file=open('dbFillers/projects.txt', 'r')
    Lines = file.readlines()
    for line in Lines:
        vals = line.split(';')
        print(vals)
        print('\n')"""
    project1 = schemas.ProjectCreate(
        companyname="Schronisko",
        projecttitle="SmartPaws",
        email="test@example.com",
        phonenumber="123456789",
        description="SmartPaws to Innowacyjny System Zarządzania Hodowlą, który ma za zadanie połączenie nowoczesnych technologii z codzienną opieką nad psami i kotami. Projekt SmartPaws będzie skoncentrowany na tworzeniu zintegrowanej platformy, która umożliwia hodowcom monitorowanie zdrowia, diety, aktywności fizycznej oraz historii genetycznej swoich zwierząt w jednym miejscu. Funkcje takie jak elektroniczna karta zdrowia zwierzęcia, czy moduł śledzenia aktywności oraz narzędzia do zarządzania hodowlą mogą znacząco ułatwić hodowcom planowanie parowań, śledzenie linii genetycznych oraz zapewnienie najlepszej możliwej opieki swoim zwierzętom. SmartPaws może również integrować społeczność hodowców poprzez forum wymiany doświadczeń i wiedzy, co sprzyja rozwojowi zrównoważonej i etycznej hodowli.Zadaniem grupy realizującej projekt będzie opracowanie opisanej platformy z elementami uczenia maszynowego do analizy zdjęć> algorytmy mają na celu rozpoznawanie poprawności informacji na dodawanych zdjęciach. Preferowane technologie: Java / Spring, Python",
        mingroupsize=3,
        maxgroupsize=4,
        groupnumber=1,
        englishgroup=str("Angielski")
    )
    project2 = schemas.ProjectCreate(
        companyname="Deloitte",
        projecttitle="Go no Juts:Shikamaru's Challange",
        email="test@example.com",
        phonenumber="123456789",
        description="Wersja Japońska:戦略的頭脳で知られる奈良シカマルは、隠された村・木ノ葉隠れの村で、古来より伝わる謎めいた囲碁のルールに出会う。しかし、ゲームの仮想世界は人工知能納豆によって脅かされ、プレイヤーたちを恐怖に陥れ始めた。シカマルは挑戦することを決意し、仲間とともに、最先端の人工知能納豆アルゴリズムをも欺くことができる古代のルールを探している。新たなルールを発見し、それを実行することで、秘策の里の平穏を取り戻そうというのだ。戦略家魂を持ち、シカマルの壮大な冒険を手助けしたい方は、ぜひご参加ください！一緒に、伝統と革新が融合した囲碁のプラットフォームを作り、戦略の世界に新たなフロンティアを発見しましょう！タスクの説明通常の囲碁ゲームでは、一定の大きさの碁盤（9路盤、13路盤、19路盤など）で対局する。囲碁プレイヤーにとって、周期的な碁盤で対局してみることは興味深い経験になるだろう。周期碁盤は一定の大きさ（例えば9x9）を持つが、境界はない。碁盤の代わりに、上下左右に同じ配置の牌を持つ別の碁盤があると想像することができる。このゲームでは、ズームインやズームアウトができるようにして、何が起こっているのかをよく見渡せるようにし、たとえば形を分析するときに、よりよい判断ができるようにする。野心的な人のために、球体（この場合、上辺と下辺だけが存在し、辺は存在しない）や立方体（角で盤面が崩れるのが面白く、追加のゲーム戦略を定義する必要がある）上にゲーム盤を作成するオプションもある。テクノロジー- フロントエンドのAngularまたはReact- 厳選されたグラフィックライブラリのサポート- UnityまたはUnreal EngineWersja Polska:W Ukrytej Wiosce 木ノ葉隠れの村 Shikamaru Nara, znany ze swojego strategicznego umysłu, natrafił na tajemnicze starożytne zasady gry w Go, które obiecywały rewolucję w świecie strategii. Jednakże, wirtualny świat gry został zagrożony przez Sztuczną Inteligencję 納豆, która zaczęła terroryzować graczy.Shikamaru postanowił podjąć wyzwanie i wraz z przyjaciółmi poszukuje tych starożytnych zasad, zdolnych zwieść nawet najbardziej zaawansowane algorytmy A.I. 納豆. Wspólnie zamierzają odkryć i zaimplementować te nowe zasady, przywracając spokój 木ノ葉隠れの村. Jeśli masz duszę stratega i chcesz pomóc Shikamaru w tej epickiej przygodzie, dołącz do nas! Razem możemy stworzyć platformę do gry w Go, łącząc tradycję z innowacją, i odkryć nowe granice w świecie strategii!Opis zadania:W zwykłej grze w go gramy na planszy o określonym rozmiarze (np. 9x9, 13x13 lub 19x19). Ciekawym doświadczeniem dla graczy go byłoby spróbowanie gry na planszy cyklicznej. Cykliczna plansza ma określony rozmiar (np. 9x9), ale nie ma granic. Można to sobie wyobrazić tak, że zamiast planszy jest inna plansza z taką samą konfiguracją kamieni powyżej, poniżej, a także po lewej i prawej stronie. Gra powinna pozwalać na powiększanie i pomniejszanie, aby uzyskać dobrą perspektywę na to, co się dzieje, aby podejmować lepsze decyzje podczas np. analizowania kształtów.Dla ambitnych również opcja stworzenia planszy do gry na kuli (wtedy istnieje tylko krawędź górna i dolna, nie istnieją boczne) oraz na sześcianie (ciekawe załamanie planszy w rogach które wymaga określenia dodatkowych strategii gry)Technologia:- Frontend Angular lub React- Wsparcie wybranymi bibliotekami graficznymi- Dla chętnych Unity lub Unreal Engine",
        mingroupsize=3,
        maxgroupsize=4,
        groupnumber=1,
        englishgroup=str("Angielski")
    )
    project3 = schemas.ProjectCreate(
        companyname="Firma",
        projecttitle="tytuł",
        email="test@example.com",
        phonenumber="123456789",
        description="bardzo dlugo opis testowy zawierający różne znaki",
        mingroupsize=1,
        maxgroupsize=5,
        groupnumber=3,
        englishgroup=str("Angielski")
    )
    created_projects=[]
    created_projects.append(CRUD.create_project(db, project1))
    created_projects.append(CRUD.create_project(db, project2))
    created_projects.append(CRUD.create_project(db, project3))
    return created_projects


fill_database()