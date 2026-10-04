from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from typing import Optional
import json

load_dotenv()

# API key is read from environment variable GEMINI_API_KEY
# If not set, client initialization will fail gracefully
try:
    client = genai.Client()
except Exception:
    client = None

class Hackathon_Data(BaseModel):
    title: Optional[str] = None,
    organizer: Optional[str] = None,
    platform: Optional[str] = None,
    description: Optional[str] = None,
    url: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    registration_deadline: Optional[str] = None,
    mode: Optional[str] = None,
    location: Optional[str] = None,
    eligibility: Optional[str] = None,
    team_size: Optional[str] = None,
    prize: Optional[str] = None

def gemini_classify(query:str):
    if client is None:
        # No Gemini API key configured - return null result
        return json.dumps({
            "title": None,
            "organizer": None,
            "platform": None,
            "description": None,
            "url": None,
            "start_date": None,
            "end_date": None,
            "registration_deadline": None,
            "mode": None,
            "location": None,
            "eligibility": None,
            "team_size": None,
            "prize": None
        })
    
    interaction = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=f"""
            You are a hackathon discovery and data extraction system.

            Your task is to analyze the provided search result and determine whether it represents
            a SPECIFIC hackathon event.

            IMPORTANT CLASSIFICATION RULES:

            1. A result is valid only if it represents a specific hackathon event or competition
            that a user could potentially participate in.

            2. A result is NOT a specific hackathon if it is:
            - A general hackathon listing page
            - A platform/category page containing multiple hackathons
            - A search results page
            - An article about hackathons
            - A blog post about hackathons
            - A Reddit, Quora, forum, or discussion post
            - A tutorial or educational page about hackathons
            - A page describing hackathons in general
            - A page about previous hackathon winners without the actual event
            - A company/platform page that only lists its hackathon offerings
            - A general events page containing multiple events
            - A page where there is no identifiable specific hackathon event

            3. Examples of results that should NOT be treated as a specific hackathon:
            - "AI Hackathons"
            - "Hackathons"
            - "Upcoming Hackathons"
            - "HackerEarth Hackathons"
            - "Hackathons for Frontier Tech"
            - "Online Hackathons"
            - "Best Hackathons to Participate In"
            
            These are categories, collections, or listing pages rather than individual events.

            4. If the result is NOT a specific hackathon:
            - Set EVERY field to null.
            - Do not extract partial information.
            - Do not use the website/platform name as the hackathon title.

            5. If the result IS a specific hackathon:
            - Extract the information that is explicitly available.
            - Do not invent or guess any information.
            - If a field is not available, set it to null.
            - Preserve the information from the source as accurately as possible.

            6. The title must be the name of the SPECIFIC hackathon.
            Do not use a platform name, category name, website name, or generic term as the title.

            7. The organizer is the organization/company/community actually organizing the
            specific hackathon, if explicitly available.

            8. The platform is the website/platform hosting the hackathon, such as:
            Devpost, HackerEarth, Unstop, DoraHacks, Lablab.ai, etc.
            Do not assume the platform is the organizer.

            9. Dates must only be extracted when explicitly available.
            Never calculate or guess dates.

            10. Prize information must only be extracted when explicitly stated.
                Never estimate or invent prize amounts.

            11. Eligibility must only contain explicitly stated eligibility requirements.

            12. Team size must only be extracted when explicitly stated.

            13. Mode should describe the event as online, offline, or hybrid only when
                the source provides enough information to determine this.

            14. Location should only be provided when explicitly available.
                For online events, location may remain null unless the source specifies one.

            15. The URL should be the URL of the specific hackathon event whenever available.
                Do not use the homepage or a general listing page as the event URL.

            16. Description should briefly describe the specific hackathon based only on the
                provided information.

            17. Do not use outside knowledge.
                Use ONLY the information contained in the provided search result.

            18. If there is insufficient evidence to determine whether the result is a
                specific hackathon, treat it as NOT a specific hackathon and return null
                for every field.

            OUTPUT REQUIREMENT:

            Return the result using the provided structured schema.

            For a non-hackathon or non-specific hackathon result, every field must be null.

            Search result to analyze:

            {query}
            """,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": Hackathon_Data.model_json_schema()
        },
    )
    return interaction.output_text



