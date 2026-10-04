import hashlib
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.database.mongodb import get_db
from app.schemas.auth import RegisterInput, LoginInput, ApiResponse
from app.schemas.user import MeOutput


router = APIRouter(tags=["Auth"])


def get_password_hash(password: str) -> str:
    """Hash a password for storage."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return get_password_hash(plain_password) == hashed_password


# Dependency to get DB connection
def get_db():
    from app.database.mongodb import get_db as _get_db
    return _get_db()


@router.post("/register", response_model=ApiResponse)
async def register(user_data: RegisterInput):
    """Register a new user."""
    db = get_db()
    users = db["users"]
    
    # Check if user already exists
    existing = users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    password_hash = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": password_hash,
        "interests": user_data.interests or [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = users.insert_one(user_doc)
    
    return ApiResponse(
        success=True,
        message="Registered successfully",
        data={"user_id": str(result.inserted_id), "email": user_data.email, "name": user_data.name}
    )


@router.post("/login", response_model=ApiResponse)
async def login(login_data: LoginInput):
    """Login a user."""
    db = get_db()
    users = db["users"]
    
    # Find user by email
    user = users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return ApiResponse(
        success=True,
        message="Logged in successfully",
        data={"user_id": str(user["_id"]), "email": user["email"], "name": user["name"], "interests": user.get("interests", [])}
    )


@router.get("/me", response_model=ApiResponse)
async def me(email: str = None):
    """Get current user profile."""
    # If email not provided, we can't look up the user
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email required"
        )
    
    db = get_db()
    users = db["users"]
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ApiResponse(
        success=True,
        message="User profile retrieved",
        data={
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "interests": user.get("interests", []),
            "created_at": user.get("created_at", datetime.utcnow()),
            "updated_at": user.get("updated_at", datetime.utcnow()),
        }
    )