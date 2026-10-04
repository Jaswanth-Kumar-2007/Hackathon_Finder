from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/login",
    tags = ["login"]
)

class LoginFormat(BaseModel):
    email:str
    password:str

@router.get("/")
def root():
    return {"message":"Login API Running Successfully"}

@router.post("/login_data")
def get_data(data:LoginFormat):
    print(data.email)
    print(data.passowrd)