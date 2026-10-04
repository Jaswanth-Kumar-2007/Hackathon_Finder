from fastapi import APIRouter, Query
from services import normalization

router = APIRouter(
    prefix="/search",
    tags = ["Search"]
)

@router.get("/")
def root():
    return {"message":"Search API is Running"}

@router.get("/results")
def search_results(q: str = Query(None)):
    if not q:
        return {"results": [], "count": 0}
    try:
        results = normalization.search_pipeline(q)
        return {"results": results, "count": len(results), "query": q}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"results": [], "count": 0, "error": str(e)}