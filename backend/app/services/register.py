from fastapi import APIRouter
from pydantic import BaseModel

class RegisterFormat(BaseModel):
    name:str
    email:str
    password:str

router = APIRouter(
    prefix="/register",
    tags = ["register"]
)

data = []

@router.get("/")
def root():
    return {"message":"Register API Running Successfully"}

@router.post("/register_data")
def get_data(user:RegisterFormat):
    res = {}
    res["name"] = user.name
    res["email"] = user.email
    res["password"] = user.password
    data.append(res)
    return {"message":"Registered Successfully"}

@router.get("/data")
def see_data():
    return data