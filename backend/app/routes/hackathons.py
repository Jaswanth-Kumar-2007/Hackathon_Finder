import json
import re
import logging
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.database.mongodb import get_db, hackathons, init_app, close_db, saved_hackathons
from app.schemas.hackathon import HackathonFilter, HackathonResponse, HackathonListItem
from app.schemas.auth import ApiResponse
from app.services.serpapi_app import web_search
from app.services.gemini_service import gemini_classify
from app.services.extraction import extract_data
from services.scraper_service import scrape_url, detect_platform

router = APIRouter(tags=["Hackathons"])
logger = logging.getLogger(__name__)


# --- Helper functions ---

def normalize_date_value(value) -> Optional[str]:
    """Normalize a date value to ISO string, or return None if invalid."""
    if value is None or value == "" or value == "null" or value is None:
        return None
    # If already ISO format string, return as-is
    if isinstance(value, str) and "T" in value and len(value) >= 10:
        try:
            # Validate it's a proper date
            datetime.fromisoformat(value)
            return value
        except (ValueError, TypeError):
            return None
    # Try to parse as date
    try:
        parsed = datetime.fromisoformat(str(value))
        return parsed.isoformat()
    except (ValueError, TypeError):
        return None


def normalize_number_value(value) -> Optional[float]:
    """Normalize a numeric value, return None if invalid."""
    if value is None or value == "":
        return None
    try:
        v = float(value)
        if v != v:  # NaN check
            return None
        return v
    except (ValueError, TypeError):
        return None


def find_or_create_hackathon(
    platform: str,
    discovered_url: str,
    title: str,
    organizer: Optional[str],
    description: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    registration_deadline: Optional[str],
    mode: Optional[str],
    location: Optional[str],
    eligibility: Optional[List[str]],
    team_size_min: Optional[float],
    team_size_max: Optional[float],
    prize: Optional[float],
    categories: Optional[List[str]],
    technologies: Optional[List[str]],
    source: str,
) -> dict:
    """Find existing hackathon or create new one (deduplication).

    Uses platform + discovered_url as the unique compound key.
    If found, updates missing fields (preserves existing non-null values).
    If not found, creates a new document.

    This is a synchronous function - do NOT add await.
    """

    coll = hackathons()

    # Step 1: Try to find existing by platform + discovered_url
    existing = coll.find_one({
        "platform": platform,
        "discovered_url": discovered_url,
    })

    # Normalize team size
    final_min = team_size_min if team_size_min is not None and team_size_min > 0 else 1
    final_max = team_size_max if team_size_max is not None and team_size_max > 0 else 1

    # Normalize prize
    final_prize = normalize_number_value(prize)

    # Normalize eligibility
    final_eligibility = eligibility or []

    # Normalize categories
    final_categories = categories or []

    if existing:
        # Update existing record - only update fields with non-null new values
        update_data = {
            "$set": {
                "title": title if title else existing.get("title"),
                "organizer": organizer if organizer else existing.get("organizer"),
                "description": description if description else existing.get("description"),
                "start_date": start_date if start_date else existing.get("start_date"),
                "end_date": end_date if end_date else existing.get("end_date"),
                "registration_deadline": registration_deadline if registration_deadline else existing.get("registration_deadline"),
                "mode": mode if mode else existing.get("mode"),
                "location": location if location else existing.get("location"),
                "eligibility": final_eligibility if final_eligibility else existing.get("eligibility"),
                "team_size_min": final_min,
                "team_size_max": final_max,
                "prize": final_prize if final_prize is not None else existing.get("prize"),
                "categories": final_categories if final_categories else existing.get("categories"),
                "technologies": technologies if technologies else existing.get("technologies"),
                "updated_at": datetime.utcnow(),
            }
        }
        coll.update_one(
            {"_id": existing["_id"]},
            update_data,
        )
        # Return updated document
        updated = coll.find_one({"_id": existing["_id"]})
        return {**dict(updated), "_id": str(updated["_id"])}

    # Step 2: Create new hackathon document
    doc = {
        "platform": platform,
        "discovered_url": discovered_url,
        "title": title,
        "organizer": organizer,
        "description": description,
        "start_date": start_date,
        "end_date": end_date,
        "registration_deadline": registration_deadline,
        "mode": mode,
        "location": location,
        "eligibility": final_eligibility,
        "team_size_min": final_min,
        "team_size_max": final_max,
        "prize": final_prize,
        "categories": final_categories,
        "technologies": technologies,
        "source": source,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = coll.insert_one(doc)
    return {**doc, "_id": str(result.inserted_id)}


# --- API Endpoints ---


@router.get("", response_model=ApiResponse)
async def list_hackathons(
    platform: Optional[List[str]] = Query(default=None, description="Platform filter"),
    mode: Optional[List[str]] = Query(default=None, description="Mode filter"),
    category: Optional[List[str]] = Query(default=None, description="Category filter"),
    eligibility: Optional[List[str]] = Query(default=None, description="Eligibility filter"),
    date: Optional[str] = Query(default="any", description="Date filter: any, soon, week, month"),
    prize: Optional[List[str]] = Query(default=None, description="Prize filter"),
    limit: Optional[int] = Query(default=50, description="Maximum results"),
):
    """List hackathons with filters."""
    coll = hackathons()

    # Build filter query
    filter_query = {}

    if platform:
        filter_query["platform"] = {"$in": platform}

    if mode:
        filter_query["mode"] = {"$in": mode}

    if category:
        filter_query["categories"] = {"$in": category}

    if eligibility:
        filter_query["eligibility"] = {"$in": eligibility}

    # Date filtering
    if date and date != "any":
        now = datetime.utcnow()
        if date == "soon":
            # Starting within 14 days
            from datetime import timedelta
            fourteen_later = now + timedelta(days=14)
            filter_query["start_date"] = {
                "$gte": now.isoformat(),
                "$lte": fourteen_later.isoformat(),
            }
        elif date == "week":
            # Starting within 7 days
            seven_later = now + timedelta(days=7)
            filter_query["start_date"] = {
                "$gte": now.isoformat(),
                "$lte": seven_later.isoformat(),
            }
        elif date == "month":
            # Starting within 30 days
            from datetime import timedelta
            thirty_later = now + timedelta(days=30)
            filter_query["start_date"] = {
                "$gte": now.isoformat(),
                "$lte": thirty_later.isoformat(),
            }

    if prize:
        # Filter by prize amount
        prize_filters = [
            normalize_number_value(p)
            for p in prize
            if normalize_number_value(p) is not None
        ]
        if prize_filters:
            filter_query["prize"] = {"$in": prize_filters}

    # Execute query
    cursor = coll.find(filter_query).sort("created_at", -1)
    if limit:
        cursor = cursor.limit(limit)

    docs = list(cursor)

    # Convert to response format
    results = []
    for doc in docs:
        results.append({
            "id": str(doc["_id"]),
            "title": doc.get("title"),
            "organizer": doc.get("organizer"),
            "platform": doc.get("platform"),
            "description": doc.get("description"),
            "url": doc.get("url"),
            "start_date": doc.get("start_date"),
            "end_date": doc.get("end_date"),
            "registration_deadline": doc.get("registration_deadline"),
            "mode": doc.get("mode"),
            "location": doc.get("location"),
            "eligibility": doc.get("eligibility"),
            "team_size": (
                {"min": float(doc["team_size_min"]), "max": float(doc["team_size_max"])}
                if doc.get("team_size_min") is not None
                else None
            ),
            "prize": normalize_number_value(doc.get("prize")),
            "categories": doc.get("categories"),
            "technologies": doc.get("technologies"),
            "official_url": doc.get("url"),
        })

    return ApiResponse(
        success=True,
        message=f"Found {len(results)} hackathons",
        data={"hackathons": results, "count": len(results)}
    )


@router.get("/{hackathon_id}", response_model=ApiResponse)
async def get_hackathon(
    hackathon_id: str,
):
    """Get a specific hackathon by ID."""
    coll = hackathons()

    doc = coll.find_one({"_id": ObjectId(hackathon_id)})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    return ApiResponse(
        success=True,
        message="Hackathon retrieved",
        data={
            "id": str(doc["_id"]),
            "title": doc.get("title"),
            "organizer": doc.get("organizer"),
            "platform": doc.get("platform"),
            "description": doc.get("description"),
            "url": doc.get("url"),
            "start_date": doc.get("start_date"),
            "end_date": doc.get("end_date"),
            "registration_deadline": doc.get("registration_deadline"),
            "mode": doc.get("mode"),
            "location": doc.get("location"),
            "eligibility": doc.get("eligibility"),
            "team_size": (
                {"min": float(doc["team_size_min"]), "max": float(doc["team_size_max"])}
                if doc.get("team_size_min") is not None
                else None
            ),
            "prize": normalize_number_value(doc.get("prize")),
            "categories": doc.get("categories"),
            "technologies": doc.get("technologies"),
            "official_url": doc.get("url"),
        }
    )


@router.post("/{hackathon_id}/save", response_model=ApiResponse)
async def save_hackathon(
    hackathon_id: str,
):
    """Save a hackathon for the current user."""
    # Verify hackathon exists
    coll = hackathons()
    doc = coll.find_one({"_id": hackathon_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Get user email from query parameter
    # In production would use proper auth dependency, but for now accept from query
    email = ""  # placeholder - frontend sends user_email in body

    saved_coll = saved_hackathons()

    # Check if already saved by this user
    existing = saved_coll.find_one({
        "user_email": email,
        "hackathon_id": hackathon_id,
    })

    if existing:
        # Already saved, return success
        return ApiResponse(
            success=True,
            message="Hackathon already saved"
        )

    # Save the hackathon for the user
    saved_coll.insert_one({
        "user_email": email,
        "hackathon_id": hackathon_id,
        "saved_at": datetime.utcnow(),
    })

    return ApiResponse(
        success=True,
        message="Hackathon saved successfully"
    )


@router.delete("/{hackathon_id}/save", response_model=ApiResponse)
async def unsave_hackathon(
    hackathon_id: str,
):
    """Unsave a hackathon for the current user."""
    # Verify hackathon exists
    coll = hackathons()
    doc = coll.find_one({"_id": hackathon_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Get user email from query parameter
    email = ""

    saved_coll = saved_hackathons()

    # Remove the saved hackathon record for this user
    result = saved_coll.delete_one({
        "user_email": email,
        "hackathon_id": hackathon_id,
    })

    if result.deleted_count == 0:
        # Not found in saved list, but still return success
        pass

    return ApiResponse(
        success=True,
        message="Hackathon removed from saved"
    )


@router.get("/me/saved", response_model=ApiResponse)
async def get_saved_hackathons(
    email: str = Query(..., description="User email"),
):
    """Get all saved hackathons for the current user."""
    # Verify hackathon exists
    coll = hackathons()
    saved_coll = saved_hackathons()

    # Get saved hackathons for this user from the saved_hackathons collection
    cursor = saved_coll.find({"user_email": email}).sort("saved_at", -1)
    docs = list(cursor)[:50]

    results = []
    for doc in docs:
        # Find the associated hackathon details
        hackathon_doc = coll.find_one({"_id": doc["hackathon_id"]})
        if hackathon_doc:
            results.append({
                "id": str(hackathon_doc["_id"]),
                "title": hackathon_doc.get("title"),
                "organizer": hackathon_doc.get("organizer"),
                "platform": hackathon_doc.get("platform"),
                "description": hackathon_doc.get("description"),
                "url": hackathon_doc.get("url"),
                "start_date": hackathon_doc.get("start_date"),
                "end_date": hackathon_doc.get("end_date"),
                "registration_deadline": hackathon_doc.get("registration_deadline"),
                "mode": hackathon_doc.get("mode"),
                "location": hackathon_doc.get("location"),
                "eligibility": hackathon_doc.get("eligibility"),
                "team_size": (
                    {"min": float(hackathon_doc["team_size_min"]), "max": float(hackathon_doc["team_size_max"])}
                    if hackathon_doc.get("team_size_min") is not None
                    else None
                ),
                "prize": normalize_number_value(hackathon_doc.get("prize")),
                "categories": hackathon_doc.get("categories"),
                "technologies": hackathon_doc.get("technologies"),
                "official_url": hackathon_doc.get("url"),
            })

    return ApiResponse(
        success=True,
        message=f"Found {len(results)} saved hackathons",
        data={"hackathons": results, "count": len(results)}
    )


# --- Discovery pipeline endpoint ---

@router.get("/discover", response_model=ApiResponse)
async def discover_hackathons(
    platform: Optional[str] = Query(default=None, description="Platform to search (devpost, hackerearth, unstop, devfolio)"),
    limit: int = Query(default=20, description="Maximum results to return"),
):
    """Discover hackathons using SerpApi + scraping + Gemini pipeline.

    The pipeline:
    1. SerpApi search for candidate pages
    2. Domain/platform filtering
    3. URL/page filtering (exclude non-event pages)
    4. Scrape the actual webpage content
    5. Send scraped content to Gemini for classification
    6. Normalize and store in MongoDB with dedup
    7. Return structured records
    """
    # Initialize MongoDB if not already
    init_app()

    # Construct query based on platform
    if platform and platform.lower() == "devpost":
        query = "site:devpost.com hackathon 2026"
    elif platform and platform.lower() == "hackerearth":
        query = "site:hackerearth.com hackathon 2026"
    elif platform and platform.lower() == "unstop":
        query = "site:unstop.com hackathon 2026"
    elif platform and platform.lower() == "devfolio":
        query = "site:devfolio.co hackathon 2026"
    else:
        query = "hackathon 2026"

    # Step 1: SerpApi search for discovery
    try:
        search_results = web_search(query)
    except Exception as e:
        logger.error("SerpApi search failed: %s", str(e))
        return ApiResponse(
            success=False,
            message=f"SerpApi search failed: {str(e)}",
            data={"hackathons": [], "count": 0}
        )

    if not search_results or "organic_results" not in search_results:
        return ApiResponse(
            success=True,
            message="No search results found",
            data={"hackathons": [], "count": 0}
        )

    organic_results = search_results["organic_results"]

    # Step 2: Process each result through the pipeline
    processed = 0
    saved_count = 0
    errors = []

    for ans in organic_results:
        processed += 1
        title = ans.get("Title", "")
        url = ans.get("link", "")
        snippet = ans.get("Snippet", "")
        about = ans.get("about_this_result", "")
        source_name = ans.get("Source", "")

        if not title or not url:
            continue

        # Detect platform from URL
        detected_platform = detect_platform(url)

        # Platform filtering - only process if matches requested filter or auto-detected
        if platform and detected_platform and platform.lower() != detected_platform:
            continue

        # Skip excluded pages (e.g., Devpost project-gallery, etc.)
        if detected_platform == "devpost":
            from urllib.parse import urlparse
            parsed = urlparse(url)
            path_parts = parsed.path.lower().strip("/").split("/")
            excluded_paths = {"project-gallery", "forum_topics", "updates", "hackathons"}
            if any(part in excluded_paths for part in path_parts):
                continue

        # Step 3: Scrape the actual webpage
        try:
            scrape_result = await scrape_url(url)
        except Exception as e:
            logger.warning("Scraping error for %s: %s", url, str(e))
            scrape_result = None

        if scrape_result is None or not scrape_result.get("success", False):
            # One bad result must not crash the complete pipeline
            logger.warning("Scraping failed for %s, skipping", url)
            errors.append(f"Scraping failed for {url}: {scrape_result.get('error', 'unknown') if scrape_result else 'scrape error'}")
            continue

        # Step 4: Prepare Gemini input from scraped content
        fetch_result = scrape_result.get("fetch_result", {})
        devpost_info = scrape_result.get("devpost_info", {})

        # Build Gemini input combining SerpApi metadata + scraped content
        title_for_gemini = fetch_result.get("title") or title
        description_for_gemini = fetch_result.get("description") or snippet

        # Add Devpost-specific info if available
        if devpost_info.get("event_title"):
            title_for_gemini = devpost_info["event_title"]
        if devpost_info.get("description"):
            description_for_gemini = devpost_info["description"]

        gemini_input = f"""
            Title: {title_for_gemini}
            URL: {url}
            Description: {description_for_gemini}
            Source: {source_name}
        """

        # Step 5: Send to Gemini for classification and structured extraction
        try:
            gemini_output = gemini_classify(gemini_input)
            result = json.loads(gemini_output) if gemini_output else {}
        except Exception as e:
            logger.error("Gemini classification error for %s: %s", url, str(e))
            errors.append(f"Gemini error for {url}: {str(e)}")
            continue

        # Check if Gemini says this is a valid hackathon
        # Valid hackathon has at least title non-null
        if not result.get("title") or result.get("title") in (None, "null", "Undefined"):
            # Not a specific hackathon, skip
            continue

        # Step 6: Normalize the result into our schema
        normalized = {
            "title": result.get("title") or title,
            "organizer": result.get("organizer"),
            "platform": detected_platform or platform or source_name,
            "description": result.get("description") or description_for_gemini,
            "url": url,
            "start_date": result.get("start_date"),
            "end_date": result.get("end_date"),
            "registration_deadline": result.get("registration_deadline"),
            "mode": result.get("mode"),
            "location": result.get("location"),
            "eligibility": result.get("eligibility") or [],
            "team_size_min": result.get("team_size_min"),
            "team_size_max": result.get("team_size_max"),
            "prize": result.get("prize"),
            "categories": result.get("categories") or [],
            "technologies": result.get("technologies") or [],
        }

        # Step 7: Find or create (dedup) in MongoDB
        hackathon = find_or_create_hackathon(
            platform=normalized["platform"],
            discovered_url=normalized["url"] or url,
            title=normalized["title"],
            organizer=normalized["organizer"],
            description=normalized["description"],
            start_date=normalized["start_date"],
            end_date=normalized["end_date"],
            registration_deadline=normalized["registration_deadline"],
            mode=normalized["mode"],
            location=normalized["location"],
            eligibility=normalized["eligibility"],
            team_size_min=normalized["team_size_min"],
            team_size_max=normalized["team_size_max"],
            prize=normalized["prize"],
            categories=normalized["categories"],
            technologies=normalized["technologies"],
            source=source_name or detected_platform,
        )

        saved_count += 1

    # Step 8: Return summary
    error_summary = "; ".join(errors) if errors else "No errors"

    return ApiResponse(
        success=True,
        message=f"Processed {processed} results, {saved_count} new/updated hackathons (errors: {error_summary})",
        data={"hackathons": [], "count": saved_count}
    )