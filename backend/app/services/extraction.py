from urllib.parse import urlparse

from serpapi_app import web_search


"""
SerpApi response can contain:

search_metadata
search_parameters
search_information
related_questions
ai_overview
references
organic_results
related_searches
pagination
serpapi_pagination
"""


# Supported hackathon platforms.
PLATFORM_DOMAINS = {
    "devpost": "devpost.com",
    "hackerearth": "hackerearth.com",
    "unstop": "unstop.com",
    "devfolio": "devfolio.co",
}


# URL paths that are not useful as the main hackathon page.
#
# We are deliberately NOT filtering words such as
# "winner", "results", "discussion", etc. from the
# title/snippet because a legitimate hackathon page
# may mention those words.
EXCLUDED_PATHS = {
    # Devpost
    "project-gallery",
    "forum_topics",
    "updates",

    # Generic listing/search pages
    "search",
    "explore",
    "categories",
    "category",
    "directory",
}


def get_platform_domain(query: str):
    """
    Detect the requested platform from the search query.

    Examples:

        devpost hackathon 2026
        -> devpost.com

        hackerearth hackathon 2026
        -> hackerearth.com
    """

    query_lower = query.lower()

    for platform, domain in PLATFORM_DOMAINS.items():

        if platform in query_lower:
            return domain

        if domain in query_lower:
            return domain

    return None


def is_allowed_domain(url: str, required_domain: str):
    """
    Check whether a URL belongs to the requested platform.

    Example:

        https://pantherhacks2026.devpost.com/

    is allowed for:

        devpost.com
    """

    if not url or not required_domain:
        return False

    try:
        hostname = urlparse(url).hostname

        if not hostname:
            return False

        hostname = hostname.lower()

        # Exact domain
        if hostname == required_domain:
            return True

        # Subdomain
        #
        # Example:
        # pantherhacks2026.devpost.com
        #
        # ends with:
        # .devpost.com
        if hostname.endswith("." + required_domain):
            return True

        return False

    except Exception:
        return False


def is_excluded_page(url: str):
    """
    Reject pages that are not useful as hackathon event pages.

    Examples rejected:

        /project-gallery
        /forum_topics/...
        /updates/...

    Examples allowed:

        /
        /details/dates
        /rules
    """

    if not url:
        return True

    try:
        parsed_url = urlparse(url)

        path = parsed_url.path.lower().strip("/")

        # Root event page is valid.
        #
        # Example:
        # https://pantherhacks2026.devpost.com/
        if not path:
            return False

        path_parts = path.split("/")

        for part in path_parts:

            if part in EXCLUDED_PATHS:
                return True

        return False

    except Exception:
        return True


def extract_data(query: str):
    """
    Search using SerpApi and return filtered candidate results.

    Pipeline:

        SerpApi
           ↓
        Domain filter
           ↓
        URL/page filter
           ↓
        Clean candidate results
           ↓
        Gemini
    """

    # --------------------------------------------------
    # 1. Search using SerpApi
    # --------------------------------------------------

    res = web_search(query)

    output = []

    # --------------------------------------------------
    # 2. Check for organic results
    # --------------------------------------------------

    if "organic_results" not in res:
        return output

    data = res["organic_results"]

    # --------------------------------------------------
    # 3. Detect requested platform
    # --------------------------------------------------

    required_domain = get_platform_domain(query)

    # --------------------------------------------------
    # 4. Process every SerpApi result
    # --------------------------------------------------

    for ans in data:

        title = ans.get("title", "")
        snippet = ans.get("snippet", "")
        link = ans.get("link", "")
        about_result = ans.get("about_this_result", "")
        source = ans.get("source", "")

        # --------------------------------------------------
        # Domain filtering
        # --------------------------------------------------

        if required_domain:

            if not is_allowed_domain(
                link,
                required_domain
            ):
                continue

        # --------------------------------------------------
        # Page-type filtering
        # --------------------------------------------------

        if is_excluded_page(link):
            continue

        # --------------------------------------------------
        # Basic validation
        # --------------------------------------------------

        if not title:
            continue

        if not link:
            continue

        # --------------------------------------------------
        # Create clean result
        # --------------------------------------------------

        output_sub = {
            "Title": title,
            "Source Link": link,
            "Snippet": snippet,
            "About the Result": about_result,
            "Source": source,
        }

        output.append(output_sub)

    return output