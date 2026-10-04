import serpapi
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("SERPAPI_KEY")

def web_search(query:str):

    client = serpapi.Client(api_key=api_key, timeout=10)

    try:
        results = client.search({
            'engine':'google',
            'q':query
        })

        print(type(results))
        return results.as_dict()
    except serpapi.HTTPError as e:
        if e.status_code == 401:
            return e.error
        elif e.status_code == 400:
            return "Status 400"
        elif e.status_code == 429:
            return "Status 429"
    except serpapi.TimeoutError as e:
        return f"The Request timed out : {e}"

