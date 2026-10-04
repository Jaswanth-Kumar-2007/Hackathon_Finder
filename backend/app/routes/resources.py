from fastapi import APIRouter

router = APIRouter(
    prefix="/resources",
    tags = ["Resources"]
)

@router.get("/")
def root():
    return {"message":"Resource API is Running"}