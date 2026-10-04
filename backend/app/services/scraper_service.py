import logging
import time
from typing import Optional, Dict, Any

import httpx
from bs4 import BeautifulSoup

# Configure logger
logger = logging.getLogger(__name__)

# Default HTTP client configuration
DEFAULT_TIMEOUT = 15.0  # seconds
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (compatible; HackathonFinder/1.0; +https://hackathon-finder.example.com)"
)

# Platform domains for filtering
PLATFORM_DOMAINS = {
    "devpost": "devpost.com",
    "hackerearth": "hackerearth.com",
    "unstop": "unstop.com",
    "devfolio": "devfolio.co",
}

# Devpost paths that are NOT the main event page
DEVPOST_EXCLUDED_PATHS = {
    "project-gallery",
    "forum_topics",
    "updates",
    "hackathons",  # generic listing
}


def detect_platform(url: str) -> Optional[str]:
    """Detect the platform from a URL."""
    if not url:
        return None
    url_lower = url.lower()
    for platform, domain in PLATFORM_DOMAINS.items():
        if domain in url_lower:
            return platform
    return None


def is_devpost_url(url: str) -> bool:
    """Check if URL belongs to Devpost."""
    return detect_platform(url) == "devpost"


def is_excluded_devpost_path(url: str) -> bool:
    """Check if a Devpost URL points to a non-event page."""
    if not is_devpost_url(url):
        return False
    try:
        parsed = urlparse(url)
        path = parsed.path.lower().strip("/")
        path_parts = path.split("/")
        for part in path_parts:
            if part in DEVPOST_EXCLUDED_PATHS:
                return True
        return False
    except Exception:
        return True


def fetch_page_content(
    url: str,
    timeout: float = DEFAULT_TIMEOUT,
    user_agent: str = DEFAULT_USER_AGENT,
) -> Dict[str, Any]:
    """
    Fetch webpage content safely with timeout and User-Agent.

    Returns a dict with:
    - success: bool
    - status_code: int or None
    - content_type: str or None
    - title: str or None (from <title> tag)
    - description: str or None (meta description)
    - canonical_url: str or None (canonical link or current URL)
    - h1: str or None (first <h1>)
    - text_content: str or None (main readable text)
    - error: str or None
    - response_time: float

    Note: This function does NOT determine if the page is a hackathon.
    It only extracts readable content fields.
    """
    start_time = time.time()
    result = {
        "success": False,
        "status_code": None,
        "content_type": None,
        "title": None,
        "description": None,
        "canonical_url": None,
        "h1": None,
        "text_content": None,
        "error": None,
        "response_time": 0,
    }

    try:
        headers = {"User-Agent": user_agent}
        response = httpx.get(url, timeout=timeout, headers=headers)
        response_time = time.time() - start_time

        result["status_code"] = response.status_code
        result["content_type"] = response.headers.get("content-type")
        result["response_time"] = response_time
        result["success"] = True

        # Handle non-200 status codes
        if response.status_code != 200:
            result["error"] = f"HTTP {response.status_code}"
            logger.warning(
                "Non-200 response for %s: status=%s, response_time=%.2fs",
                url,
                response.status_code,
                response_time,
            )
            return result

        # Parse HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract title
        title_tag = soup.find("title")
        if title_tag and title_tag.get_text(strip=True):
            result["title"] = title_tag.get_text(strip=True)[:500]  # Truncate

        # Extract meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            result["description"] = meta_desc["content"][:500]

        # Extract canonical URL
        canonical = soup.find("link", attrs={"rel": "canonical"})
        if canonical and canonical.get("href"):
            result["canonical_url"] = canonical["href"]
        else:
            result["canonical_url"] = url

        # Extract first <h1>
        h1_tag = soup.find("h1")
        if h1_tag and h1_tag.get_text(strip=True):
            result["h1"] = h1_tag.get_text(strip=True)[:500]

        # Extract main text content
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        # Get text content from the body
        body = soup.find("body")
        if body:
            result["text_content"] = body.get_text(separator=" ", strip=True)[:3000]
        else:
            result["text_content"] = soup.get_text(separator=" ", strip=True)[:3000]

        logger.info(
            "Successfully fetched %s (%.2fs, title=%s, desc_len=%d)",
            url,
            response_time,
            result["title"][:50] if result["title"] else "None",
            len(result["description"]) if result["description"] else 0,
        )

    except httpx.TimeoutException as e:
        response_time = time.time() - start_time
        result["error"] = f"Timeout after {timeout}s"
        result["response_time"] = response_time
        logger.warning("Timeout fetching %s: %s", url, str(e))

    except httpx.HTTPError as e:
        response_time = time.time() - start_time
        result["error"] = f"HTTP error: {str(e)}"
        result["response_time"] = response_time
        logger.warning("HTTP error fetching %s: %s", url, str(e))

    except Exception as e:
        response_time = time.time() - start_time
        result["error"] = f"Unexpected error: {str(e)}"
        result["response_time"] = response_time
        logger.error("Unexpected error fetching %s: %s", url, str(e))

    return result


def extract_devpost_event_info(
    url: str,
    html_content: str,
) -> Dict[str, Any]:
    """
    Extract hackathon-specific information from a Devpost URL.

    This is a helper that extracts structured data from Devpost event pages.
    It does NOT determine if the page is a hackathon - that decision is left
    to Gemini. It only extracts available structured information.

    Returns dict with:
    - event_title: str or None
    - organizer: str or None
    - description: str or None
    - start_date: str or None
    - end_date: str or None
    - registration_deadline: str or None
    - prize: str or None
    - mode: str or None
    - location: str or None
    """
    soup = BeautifulSoup(html_content, "html.parser")

    result = {
        "event_title": None,
        "organizer": None,
        "description": None,
        "start_date": None,
        "end_date": None,
        "registration_deadline": None,
        "prize": None,
        "mode": None,
        "location": None,
    }

    try:
        # Try to find the event title - Devpost typically uses specific selectors
        title_selectors = [
            ".event-title",
            ".hackathon-title",
            "h1",
            ".title",
        ]
        for selector in title_selectors:
            elem = soup.select_one(selector)
            if elem and elem.get_text(strip=True):
                result["event_title"] = elem.get_text(strip=True)[:200]
                break

        # Extract description - look for description section
        desc_selectors = [
            ".event-description",
            ".description",
            ".hackathon-description",
            "meta[name='description']",
        ]
        for selector in desc_selectors:
            if selector.startswith("meta"):
                meta = soup.find("meta", attrs={"name": "description"})
                if meta:
                    result["description"] = meta.get("content")[:500]
                    break
            else:
                elem = soup.select_one(selector)
                if elem:
                    text = elem.get_text(separator=" ", strip=True)[:1000]
                    if text:
                        result["description"] = text
                    break

        # Devpost typically has structured data - try to extract key fields
        # This is intentionally simple - Gemini will do the heavy classification
        # We just extract whatever is explicitly available

    except Exception as e:
        logger.warning("Error extracting Devpost event info from %s: %s", url, str(e))

    return result


def scrape_url(
    url: str,
    platform_filter: Optional[str] = None,
    timeout: float = DEFAULT_TIMEOUT,
) -> Optional[Dict[str, Any]]:
    """
    Scrape a single URL and return structured content.

    This is the main entry point for the scraper pipeline.

    Args:
        url: The URL to scrape
        platform_filter: Optional platform filter (e.g., "devpost")
        timeout: Request timeout in seconds

    Returns:
        Dict with scraped content, or None if scraping should be skipped.
        The dict contains:
        - success: bool
        - url: the original URL
        - platform: detected platform or None
        - fetch_result: result from fetch_page_content
        - devpost_info: extracted Devpost-specific info (if applicable)
        - error: error message if failed

    Note: Returns None if the URL fails domain/platform filtering.
    """
    # Step 1: Platform/domain filtering
    detected_platform = detect_platform(url)
    if platform_filter and detected_platform != platform_filter:
        logger.debug(
            "URL %s platform %s doesn't match filter %s, skipping",
            url,
            detected_platform,
            platform_filter,
        )
        return None

    # Step 2: Devpost path filtering - exclude non-event pages
    if is_devpost_url(url) and is_excluded_devpost_path(url):
        logger.debug("Devpost URL %s is an excluded page, skipping", url)
        # Still return a result so the pipeline knows it was processed
        # but marks it as an excluded page
        fetch_result = fetch_page_content(url, timeout=timeout)
        return {
            "success": False,
            "url": url,
            "platform": detected_platform,
            "fetch_result": fetch_result,
            "devpost_info": None,
            "error": "Excluded Devpost page type",
        }

    # Step 3: Fetch the webpage
    fetch_result = fetch_page_content(url, timeout=timeout)

    if not fetch_result["success"]:
        logger.warning(
            "Failed to fetch %s: %s",
            url,
            fetch_result.get("error", "unknown error"),
        )
        return {
            "success": False,
            "url": url,
            "platform": detected_platform,
            "fetch_result": fetch_result,
            "devpost_info": None,
            "error": fetch_result.get("error", "fetch failed"),
        }

    # Step 4: Extract platform-specific info (e.g., Devpost)
    devpost_info = None
    if is_devpost_url(url) and fetch_result["success"]:
        devpost_info = extract_devpost_event_info(url, fetch_result["text_content"])

    # Step 5: Return structured output
    output = {
        "success": fetch_result["success"],
        "url": url,
        "platform": detected_platform,
        "fetch_result": fetch_result,
        "devpost_info": devpost_info,
        "error": fetch_result.get("error"),
    }

    logger.info(
        "Scraped %s: success=%s, platform=%s, has_title=%s, has_description=%s",
        url,
        fetch_result["success"],
        detected_platform,
        bool(fetch_result["title"]),
        bool(fetch_result["description"]),
    )

    return output