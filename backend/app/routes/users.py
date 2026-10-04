from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.database.mongodb import get_db
from app.schemas.user import InterestsUpdate, UserSummary


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserSummary)
async def get_me(email: str = Query(..., description="User email")):
    """Get current user profile with interests."""
    db = get_db()
    users = db["users"]
    
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserSummary(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        interests=user.get("interests", []),
        created_at=user.get("created_at"),
        updated_at=user.get("updated_at"),
    )


@router.put("/me/interests", response_model=dict)
async def update_interests(
    interests_data: InterestsUpdate,
    email: str = Query(..., description="User email"),
):
    """Update user's interests."""
    db = get_db()
    users = db["users"]
    
    # Validate interests against allowed list
    allowed_interests = [
        "AI / ML", "Web Development", "Mobile Development", "Cloud",
        "Cybersecurity", "Blockchain", "Data Science", "Open Source", "IoT", "Game Development"
    ]
    
    for interest in interests_data.interests:
        if interest not in allowed_interests:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid interest: {interest}. Allowed: {', '.join(allowed_interests)}"
            )
    
    # Update user interests
    result = users.update_one(
        {"email": email},
        {
            "$set": {"interests": interests_data.interests, "updated_at": datetime.utcnow()},
        },
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": email,
        "interests": interests_data.interests,
        "message": "Interests updated successfully"
    }