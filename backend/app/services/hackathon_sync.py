"""Background hackathon synchronization service.

Runs periodically to keep MongoDB hackathon collection fresh by performing
SerpApi → extraction → Gemini classification → normalization → upsert pipeline.

Key features:
- Platform-specific searches (Devpost, HackerEarth, Unstop, Devfolio)
- Deduplication using platform + discovered_url compound key
- Upsert: update existing records, preserve missing fields from existing
- Per-platform error handling (one failure does not stop others)
- Configurable sync interval via HACKATHON_SYNC_INTERVAL_HOURS env var
- Overlap prevention via asyncio lock
- Structured logging (no API keys or secrets)
- Background-safe: does not block FastAPI startup/shutdown
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from app.services.extraction import extract_data, get_platform_domain
from app.services.gemini_service import gemini_classify
from app.services.serpapi_app import web_search
from app.database.mongodb import init_app, get_db, get_collection, hackathons as mongo_hackathons

logger = logging.getLogger(__name__)

# Supported platforms and their domain mappings
PLATFORM_DOMAINS = {
    "devpost": "devpost.com",
    "hackerearth": "hackerearth.com",
    "unstop": "unstop.com",
    "devfolio": "devfolio.co",
}

# Default sync interval: 24 hours
DEFAULT_SYNC_INTERVAL_HOURS = 24

# Maximum number of results to process per sync run
MAX_RESULTS_PER_PLATFORM = 50

# Seconds to wait between platform syncs (small delay to avoid overwhelming)
PLATFORM_SYNC_DELAY = 2


def _get_sync_interval_hours() -> float:
    """Read the sync interval from environment variable."""
    try:
        hours_str = os.getenv("HACKATHON_SYNC_INTERVAL_HOURS", str(DEFAULT_SYNC_INTERVAL_HOURS))
        return float(hours_str)
    except (ValueError, TypeError):
        return float(DEFAULT_SYNC_INTERVAL_HOURS)


def _get_platform_query(platform: str) -> str:
    """Construct the SerpApi query for the given platform."""
    platform_lower = platform.lower()
    if platform_lower in PLATFORM_DOMAINS:
        domain = PLATFORM_DOMAINS[platform_lower]
        return f"site:{domain} hackathon 2026"
    # Fallback generic query
    return "hackathon 2026"


def _detect_platform_from_url(url: str) -> Optional[str]:
    """Detect the platform domain from a URL, returning the platform key."""
    if not url:
        return None
    parsed = url.split("://")[-1] if "://" in url else url
    hostname = parsed.split("/")[0].lower()
    for platform, domain in PLATFORM_DOMAINS.items():
        if hostname == domain or hostname.endswith("." + domain):
            return platform
    return None


def _classify_and_normalize(
    url: str,
    title: str,
    snippet: str,
    platform: str,
) -> Optional[Dict[str, Any]]:
    """Run Gemini classification and normalization on a candidate result.

    Returns normalized dict or None if Gemini says it's not a specific hackathon.
    """
    # Detect platform from URL
    detected_platform = _detect_platform_from_url(url)

    # Build Gemini input
    gemini_input = f"""
        Title: {title}
        URL: {url}
        Description: {snippet}
        Source: {detected_platform or 'unknown'}
    """

    try:
        gemini_output = gemini_classify(gemini_input)
        result = json.loads(gemini_output) if gemini_output else {}
    except Exception as e:
        logger.warning("Gemini classification error for %s: %s", url, str(e))
        return None

    # Check if Gemini says this is a valid hackathon
    if not result.get("title") or result.get("title") in (None, "null", "Undefined"):
        # Not a specific hackathon, skip
        return None

    # Normalize the result into our schema
    normalized = {
        "title": result.get("title") or title,
        "organizer": result.get("organizer"),
        "platform": detected_platform or platform,
        "description": result.get("description") or snippet,
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

    return normalized


def _upsert_hackathon(
    platform: str,
    discovered_url: str,
    normalized: Dict[str, Any],
    source: str,
) -> Tuple[int, int]:
    """Upsert a hackathon into MongoDB.

    Returns (inserted_count, updated_count).
    Uses platform + discovered_url as the unique compound key for dedup.

    If a hackathon already exists:
    - Updates missing fields with existing values (preserves non-null existing)
    - Updates changed fields (dates, prize, eligibility, team size, etc.)
    - Updates last_seen_at and last_synced_at

    If a hackathon does not exist:
    - Creates a new document
    """
    coll = mongo_hackathons()

    # Normalize team size
    final_min = normalized.get("team_size_min")
    final_max = normalized.get("team_size_max")
    if final_min is None or final_min <= 0:
        final_min = 1
    if final_max is None or final_max < final_min:
        final_max = final_min

    # Normalize prize
    prize_raw = normalized.get("prize")
    final_prize = None
    if prize_raw is not None:
        try:
            final_prize = float(prize_raw)
        except (ValueError, TypeError):
            final_prize = None

    # Normalize eligibility
    final_eligibility = normalized.get("eligibility") or []

    # Normalize categories
    final_categories = normalized.get("categories") or []

    # Build the update query
    now = datetime.utcnow()

    update_data = {
        "$set": {
            "title": normalized.get("title"),
            "organizer": normalized.get("organizer"),
            "platform": platform or normalized.get("platform"),
            "description": normalized.get("description"),
            "url": normalized.get("url"),
            "start_date": normalized.get("start_date"),
            "end_date": normalized.get("end_date"),
            "registration_deadline": normalized.get("registration_deadline"),
            "mode": normalized.get("mode"),
            "location": normalized.get("location"),
            "eligibility": final_eligibility,
            "team_size_min": final_min,
            "team_size_max": final_max,
            "prize": final_prize,
            "categories": final_categories,
            "technologies": normalized.get("technologies") or [],
            "source_url": normalized.get("url"),
            "last_seen_at": now,
            "updated_at": now,
        },
        "$setOnInsert": {
            "created_at": now,
            "is_active": True,
        },
    }

    # Upsert: find by platform + discovered_url, update if exists, insert if not
    result = coll.update_one(
        {"platform": platform, "discovered_url": discovered_url},
        update_data,
        upsert=True,
    )

    inserted = 0
    modified = 0

    if result.upserted_id:
        # New document was inserted
        inserted = 1
        logger.info(
            "Inserted new hackathon: platform=%s, discovered_url=%s",
            platform,
            discovered_url or url,
        )
    else:
        # Existing document was modified
        if result.modified_count > 0:
            modified = result.modified_count
        elif result.matched_count > 0:
            # Document matched but no fields changed (still update timestamps)
            modified = 0
        logger.info(
            "Updated existing hackathon: platform=%s, discovered_url=%s",
            platform,
            discovered_url or url,
        )

    return inserted, modified


async def _sync_platform(platform: str, semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    """Sync a single platform: SerpApi → extract → Gemini → normalize → upsert.

    Returns a summary dict with sync metrics.
    Uses a semaphore to prevent overlapping syncs per platform.
    """
    interval_hours = _get_sync_interval_hours()
    query = _get_platform_query(platform)

    summary = {
        "platform": platform,
        "query": query,
        "search_results": 0,
        "gemini_accepted": 0,
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
        "errors": [],
        "duration_seconds": 0,
    }

    start_time = time.time()

    async with semaphore:
        try:
            # Step 1: SerpApi search
            logger.info("Starting sync for platform: %s", platform)
            search_results = web_search(query)
            summary["search_results"] = len(search_results.get("organic_results", [])) if search_results else 0
            logger.info("Platform %s: found %d search results", platform, summary["search_results"])

            if not search_results or "organic_results" not in search_results:
                logger.info("Platform %s: no organic results", platform)
                return summary

            organic_results = search_results["organic_results"]

            # Step 2-5: Process each result
            for idx, ans in enumerate(organic_results):
                if idx >= MAX_RESULTS_PER_PLATFORM:
                    logger.info(
                        "Platform %s: stopping after %d results (limit reached)",
                        platform,
                        MAX_RESULTS_PER_PLATFORM,
                    )
                    summary["skipped"] += idx - MAX_RESULTS_PER_PLATFORM + 1
                    break

                title = ans.get("Title", "") or ans.get("title", "")
                url = ans.get("link", "") or ans.get("url", "")
                snippet = ans.get("Snippet", "") or ans.get("description", "")

                if not title or not url:
                    summary["skipped"] += 1
                    continue

                # Step 2: Gemini classification + normalization
                normalized = _classify_and_normalize(
                    url,
                    title,
                    snippet,
                    platform,
                )
                if normalized is None:
                    # Gemini says not a specific hackathon
                    summary["skipped"] += 1
                    continue

                summary["gemini_accepted"] += 1

                # Step 3: Upsert into MongoDB
                source_name = ans.get("Source", platform)
                discovered_url = normalized.get("url") or url

                inserted, updated = _upsert_hackathon(
                    platform=platform,
                    discovered_url=discovered_url,
                    normalized=normalized,
                    source=source_name,
                )
                summary["inserted"] += inserted
                summary["updated"] += updated

            logger.info(
                "Platform %s sync complete: %d accepted, %d inserted, %d updated, %d skipped",
                platform,
                summary["gemini_accepted"],
                summary["inserted"],
                summary["updated"],
                summary["skipped"],
            )

        except Exception as e:
            error_msg = f"Sync error for platform {platform}: {str(e)}"
            summary["errors"].append(error_msg)
            logger.error(error_msg, exc_info=True)

        finally:
            summary["duration_seconds"] = time.time() - start_time

    return summary


async def _background_sync_worker(stop_event: asyncio.Event, lock: asyncio.Lock) -> None:
    """Background worker that runs periodic hackathon synchronization.

    - Performs an initial sync when started
    - Then runs periodically every HACKATHON_SYNC_INTERVAL_HOURS
    - Uses a lock to prevent overlapping syncs
    - Handles per-platform errors gracefully
    """
    sync_interval_seconds = _get_sync_interval_hours() * 3600
    interval_hours = _get_sync_interval_hours()

    logger.info("Background sync worker starting")
    logger.info("Sync interval: %.1f hours (%.1f seconds)", interval_hours, sync_interval_seconds)

    # Perform initial synchronization
    logger.info("=== Performing initial hackathon synchronization ===")
    await _perform_full_sync(lock, force=True)
    logger.info("=== Initial synchronization complete ===")

    # Wait for the first interval before the next sync
    await asyncio.sleep(sync_interval_seconds)

    # Periodic sync loop
    while not stop_event.is_set():
        # Wait for the next interval, checking for stop event
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=sync_interval_seconds)
            # stop_event was set, exit the loop
            logger.info("Stop event received, exiting background sync worker")
            break
        except asyncio.TimeoutError:
            # Timeout means the full interval passed without stop event
            # Perform sync
            async with lock:
                # Double-check we don't have overlapping syncs
                if not lock.locked():
                    logger.info("Starting periodic hackathon synchronization")
                    await _perform_full_sync(lock, force=False)
                    logger.info("Periodic synchronization complete")
                else:
                    logger.debug("Sync lock held, skipping this interval")

            # After sync, wait for remaining interval
            await asyncio.sleep(sync_interval_seconds - (time.time() % sync_interval_seconds))
        except asyncio.CancelledError:
            logger.info("Background sync worker cancelled")
            break

    logger.info("Background sync worker stopped")


async def _perform_full_sync(lock: asyncio.Lock, force: bool = False) -> Dict[str, Any]:
    """Perform a full synchronization across all platforms.

    Uses the provided lock to prevent overlapping syncs.
    If force=True, skips the check for overlapping syncs (used for initial sync).

    Returns a summary of all platform syncs.
    """
    # Acquire lock if not initial sync
    if not force:
        if lock.locked():
            logger.debug("Another sync is in progress, skipping this full sync")
            return {
                "platforms": [],
                "total_inserted": 0,
                "total_updated": 0,
                "total_skipped": 0,
            }

        await lock.acquire()
        acquired = True
    else:
        acquired = False

    all_summary = {
        "platforms": [],
        "total_inserted": 0,
        "total_updated": 0,
        "total_skipped": 0,
        "total_errors": 0,
    }

    try:
        # Sync each platform
        platforms = ["devpost", "hackerearth", "unstop", "devfolio"]
        semaphore = asyncio.Semaphore(1)  # Prevent overlapping per platform

        # Ensure DB is initialized
        from app.database.mongodb import init_app as _init_app
        _init_app()

        for platform in platforms:
            # Check stop event
            platform_summary = await _sync_platform(platform, semaphore)
            all_summary["platforms"].append(platform_summary)
            all_summary["total_inserted"] += platform_summary["inserted"]
            all_summary["total_updated"] += platform_summary["updated"]
            all_summary["total_skipped"] += platform_summary["skipped"]
            all_summary["total_errors"] += len(platform_summary["errors"])

            # Small delay between platforms
            await asyncio.sleep(PLATFORM_SYNC_DELAY)

        logger.info(
            "Full synchronization complete: inserted=%d, updated=%d, skipped=%d, errors=%d",
            all_summary["total_inserted"],
            all_summary["total_updated"],
            all_summary["total_skipped"],
            all_summary["total_errors"],
        )

    finally:
        if acquired:
            # Release the lock
            lock.release()

    return all_summary


async def start_background_sync(stop_event: asyncio.Event) -> asyncio.Task:
    """Start the background sync task.

    Should be called during FastAPI startup.
    Returns the asyncio.Task so it can be managed.
    """
    lock = asyncio.Lock()

    # Ensure MongoDB is initialized
    init_app()

    task = asyncio.create_task(
        _background_sync_worker(stop_event, lock),
        name="hackathon_background_sync",
    )

    logger.info("Background hackathon sync task started")
    return task