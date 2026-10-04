from extraction import extract_data
from gemini_service import gemini_classify
from services.scraper_service import scrape_url
import json


def search_pipeline(query: str):
    """
    Run the full search pipeline:

    1. Search using SerpApi
    2. Extract candidate results (keyword filtering)
    3. For each result, scrape the actual webpage
    4. Send scraped content to Gemini for classification/extraction
    5. Parse Gemini's JSON response
    6. Remove invalid/empty results
    7. Return valid hackathon results
    """

    # Step 1: Get results from SerpApi
    res1 = extract_data(query)

    # This will contain only valid hackathon results
    data = []

    # Step 2: Process each SerpApi result
    for ans in res1:

        try:
            # Step 3: Prepare the URL for scraping
            url = ans.get("Source Link") or ans.get("URL") or ""

            if not url:
                # No URL available, skip this result
                continue

            # Step 4: Scrape the actual webpage
            scrape_result = scrape_url(url)

            if scrape_result is None:
                # URL failed domain/platform filtering, skip
                continue

            if not scrape_result.get("success"):
                # Scraping failed - log and continue to next result
                # One bad result must not crash the complete pipeline
                logger.warning(
                    "Scraping failed for %s: %s",
                    url,
                    scrape_result.get("error", "unknown"),
                )
                # Fall back to using SerpApi snippet/title as Gemini input
                gemini_input = f"""
                    Title: {ans.get("Title", "")}
                    URL: {url}
                    Snippet: {ans.get("Snippet", "")}
                    About the Result: {ans.get("About the Result", "")}
                    Source: {ans.get("Source", "")}
                """
            else:
                # Step 5: Use scraped content as input to Gemini
                # Build Gemini input from scraped page content
                fetch_result = scrape_result.get("fetch_result", {})
                devpost_info = scrape_result.get("devpost_info", {})

                # Combine SerpApi metadata with scraped content
                title = fetch_result.get("title") or ans.get("Title", "")
                description = fetch_result.get("description") or ans.get("Snippet", "")

                # Add Devpost-specific info if available
                if devpost_info.get("event_title"):
                    title = devpost_info["event_title"]
                if devpost_info.get("description"):
                    description = devpost_info["description"]

                gemini_input = f"""
                    Title: {title}
                    URL: {url}
                    Description: {description}
                    Source: {ans.get("Source", "")}
                """

            # Step 6: Ask Gemini to classify and extract the hackathon
            result_str = gemini_classify(gemini_input)

            # Step 7: Convert Gemini JSON string into Python dictionary
            try:
                result = json.loads(result_str) if result_str else {}

            except (json.JSONDecodeError, TypeError):
                # Gemini returned invalid JSON
                result = {}

        except Exception as e:
            # If something goes wrong with this particular result,
            # skip it and continue processing the remaining results.
            logger.error(
                "Error processing result for URL %s: %s", url, str(e),
                exc_info=True,
            )
            continue

        # Step 8: Remove invalid results
        #
        # A valid hackathon result must at least have:
        # - title
        # - url
        #
        # If either one is missing, we don't want to return it.
        if not result.get("title") or not result.get("url"):
            continue

        # Step 9: Add the valid result
        data.append(result)

    # Step 10: Return all valid hackathons
    return data