from typing import Optional
from pydantic import BaseModel

class ResourceCreate(BaseModel):
    title: str
    organization: Optional[str] = None     
    category: str     
    description: Optional[str] = None     
    eligibility: Optional[str] = None     
    deadline: Optional[str] = None     
    application_url: Optional[str] = None     
    source_url: Optional[str] = None     
    location: Optional[str] = None     
    status: Optional[str] = "unknown" 