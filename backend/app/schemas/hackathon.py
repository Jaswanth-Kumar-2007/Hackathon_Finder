from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class HackathonFilter(BaseModel):
    platform: Optional[List[str]] = Field(
        default=None, description="Platform filter (Devpost, HackerEarth, Unstop, Devfolio, MLH)"
    )
    mode: Optional[List[str]] = Field(
        default=None, description="Mode filter (Online, Offline, Hybrid)"
    )
    category: Optional[List[str]] = Field(
        default=None,
        description="Category filter (ai-ml, web, cybersecurity, blockchain, cloud, data-science, mobile, open-source)",
    )
    eligibility: Optional[List[str]] = Field(
        default=None, description="Eligibility filter (Students, Beginners, Open to all)"
    )
    date: Optional[str] = Field(
        default=None, description="Date filter: any, soon, week, month"
    )
    prize: Optional[List[str]] = Field(
        default=None, description="Prize filter (any, 1000, 5000, 10000, 20000)"
    )


class HackathonResponse(BaseModel):
    id: str = Field(..., alias="_id")
    title: Optional[str] = Field(default=None, description="Hackathon title")
    organizer: Optional[str] = Field(default=None, description="Hackathon organizer")
    platform: Optional[str] = Field(
        default=None, description="Platform hosting the hackathon"
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
        default=None, description="Event mode: Online, Offline, or Hybrid"
    )
    location: Optional[str] = Field(
        default=None, description="Event location"
    )
    eligibility: Optional[List[str]] = Field(
        default=None, description="Eligibility requirements"
    )
    team_size: Optional[dict] = Field(
        default=None, description="Team size {min, max}"
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
    official_url: Optional[str] = Field(
        default=None, description="Official hackathon URL"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        validate_by_name = True


class HackathonListItem(BaseModel):
    """Lightweight model for list displays."""
    id: str = Field(..., alias="_id")
    title: Optional[str] = Field(default=None, description="Hackathon title")
    platform: Optional[str] = Field(
        default=None, description="Platform hosting the hackathon"
    )
    organizer: Optional[str] = Field(
        default=None, description="Hackathon organizer"
    )
    mode: Optional[str] = Field(
        default=None, description="Event mode: Online, Offline, or Hybrid"
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
    prize: Optional[float] = Field(
        default=None, description="Prize amount in USD"
    )
    categories: Optional[List[str]] = Field(
        default=None, description="Hackathon categories/tech tags"
    )

    class Config:
        validate_by_name = True


class PlatformStats(BaseModel):
    """Statistics for platform filtering."""
    platform: str
    count: int
    recent: Optional[dict] = Field(default=None, description="Recent hackathon info")


class InterestStats(BaseModel):
    """User interest statistics."""
    interest: str
    count: int