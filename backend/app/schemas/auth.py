from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth schemas


class RegisterInput(BaseModel):
    name: str = Field(..., min_length=2, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")
    interests: Optional[List[str]] = Field(
        default=None,
        description="User's selected interests from the controlled list",
    )


class LoginInput(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class MeOutput(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: str
    interests: List[str]
    created_at: datetime
    updated_at: datetime


# Hackathon schemas


class HackathonCreate(BaseModel):
    title: Optional[str] = Field(default=None, description="Hackathon title")
    organizer: Optional[str] = Field(default=None, description="Hackathon organizer")
    platform: Optional[str] = Field(
        default=None,
        description="Platform hosting the hackathon (Devpost, HackerEarth, Unstop, Devfolio, MLH)",
    )
    description: Optional[str] = Field(
        default=None, description="Hackathon description"
    )
    url: Optional[str] = Field(
        default=None, description="Official hackathon event URL"
    )
    start_date: Optional[str] = Field(
        default=None, description="Hackathon start date (ISO format)"
    )
    end_date: Optional[str] = Field(
        default=None, description="Hackathon end date (ISO format)"
    )
    registration_deadline: Optional[str] = Field(
        default=None, description="Registration deadline (ISO format)"
    )
    mode: Optional[str] = Field(
        default=None,
        description="Event mode: Online, Offline, or Hybrid",
    )
    location: Optional[str] = Field(
        default=None, description="Event location"
    )
    eligibility: Optional[List[str]] = Field(
        default=None, description="Eligibility requirements"
    )
    team_size_min: Optional[float] = Field(
        default=None, description="Minimum team size"
    )
    team_size_max: Optional[float] = Field(
        default=None, description="Maximum team size"
    )
    prize: Optional[float] = Field(
        default=None, description="Prize amount in USD"
    )
    categories: Optional[List[str]] = Field(
        default=None, description="Hackathon categories/tech tags"
    )
    technologies: Optional[List[str]] = Field(
        default=None, description="Technologies involved"
    )
    source: Optional[str] = Field(
        default=None, description="Source platform name"
    )
    discovered_url: Optional[str] = Field(
        default=None, description="Stable URL-based deduplication identifier"
    )


class HackathonUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="Hackathon title")
    organizer: Optional[str] = Field(default=None, description="Hackathon organizer")
    description: Optional[str] = Field(
        default=None, description="Hackathon description"
    )
    start_date: Optional[str] = Field(
        default=None, description="Hackathon start date (ISO format)"
    )
    end_date: Optional[str] = Field(
        default=None, description="Hackathon end date (ISO format)"
    )
    registration_deadline: Optional[str] = Field(
        default=None, description="Registration deadline (ISO format)"
    )
    mode: Optional[str] = Field(
        default=None, description="Event mode: Online, Offline, or Hybrid"
    )
    location: Optional[str] = Field(
        default=None, description="Event location"
    )
    eligibility: Optional[List[str]] = Field(
        default=None, description="Eligibility requirements"
    )
    team_size_min: Optional[float] = Field(
        default=None, description="Minimum team size"
    )
    team_size_max: Optional[float] = Field(
        default=None, description="Maximum team size"
    )
    prize: Optional[float] = Field(
        default=None, description="Prize amount in USD"
    )
    categories: Optional[List[str]] = Field(
        default=None, description="Hackathon categories/tech tags"
    )
    technologies: Optional[List[str]] = Field(
        default=None, description="Technologies involved"
    )


class HackathonFilter(BaseModel):
    platform: Optional[List[str]] = Field(default=None, description="Platform filter")
    mode: Optional[List[str]] = Field(default=None, description="Mode filter")
    category: Optional[List[str]] = Field(
        default=None, description="Category filter"
    )
    eligibility: Optional[List[str]] = Field(
        default=None, description="Eligibility filter"
    )
    date: Optional[str] = Field(
        default=None, description="Date filter: soon, week, month"
    )
    prize: Optional[List[str]] = Field(
        default=None, description="Prize filter"
    )


class HackathonResponse(HackathonCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True


# Saved hackathon schemas


class SavedHackathonCreate(BaseModel):
    user_email: str = Field(..., description="User's email address")
    hackathon_id: str = Field(..., description="Hackathon ID")


class SavedHackathonResponse(BaseModel):
    user_email: str
    hackathon_id: str
    created_at: datetime

    class Config:
        validate_by_name = True


# Interest schemas


class InterestsUpdate(BaseModel):
    interests: List[str] = Field(
        ...,
        description="User's selected interests from the controlled list",
        min_items=1,
    )


# API response schemas


class ApiResponse(BaseModel):
    success: bool = True
    message: str = ""
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None