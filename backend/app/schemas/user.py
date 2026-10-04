from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class MeOutput(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: str
    interests: List[str]
    created_at: datetime
    updated_at: datetime


class InterestsUpdate(BaseModel):
    interests: List[str] = Field(
        ...,
        description="User's selected interests from the controlled list",
        min_items=1,
    )


class InterestsQuery(BaseModel):
    interests: Optional[List[str]] = Field(
        default=None,
        description="Filter users by interests (backend only)",
    )


class SavedHackathonResponse(BaseModel):
    hackathon_id: str
    title: Optional[str] = Field(default=None, description="Hackathon title")
    platform: Optional[str] = Field(default=None, description="Platform")
    saved_at: datetime

    class Config:
        validate_by_name = True


class UserSummary(BaseModel):
    """Summary view for profile/API."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    interests: List[str]
    saved_count: int = Field(default=0, description="Number of saved hackathons")
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True