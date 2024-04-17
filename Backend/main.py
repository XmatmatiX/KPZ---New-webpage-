from typing import Union
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from ldap3 import Server, Connection, ALL

def LDAP_AUTH(domain,username,password):
    didConnect=False
    try:
        # Define the server and connection settings
        server = Server(f"ldap://{domain}", get_info=ALL)
        conn = Connection(server, user=f"{username}@{domain}", password=password, auto_bind=True)
        # Attempt to bind (authenticate) the user
        conn.bind()
        # Check if the bind was successful
        if conn.result['result'] == 0:
            print("Authentication successful")
            didConnect = True
    except:
            print("Authentication failed")
    finally:
        # Don't forget to close the connection when you're done
        try:
            conn.unbind()
        except:
            ''
    return didConnect

app = FastAPI()

# Define the HTTPBasic authentication scheme
security = HTTPBasic()

# Dependency to check LDAP authentication
def check_ldap_auth(credentials: HTTPBasicCredentials = Depends(security)):
    domain = "pwr.edu.pl"
    if not LDAP_AUTH(domain, credentials.username, credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return credentials.username

# Example protected route using the dependency
@app.get("/protected")
async def protected_route(username: str = Depends(check_ldap_auth)):
    return {"message": f"Hello, {username}! You have access to this protected route."}





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


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


# @app.put("/items/{item_id}")
# def update_item(item_id: int, item: Item):
#     return {"item_name": item.name, "item_id": item_id}