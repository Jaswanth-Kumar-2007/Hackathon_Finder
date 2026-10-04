import asyncio
import logging
import os
import sys

# Ensure the app directory and its subpackages are importable
_app_dir = os.path.dirname(__file__)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

_services_dir = os.path.join(_app_dir, "services")
if _services_dir not in sys.path:
    sys.path.insert(0, _services_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes directly
from app.routes.auth import router as auth_router
from app.routes.hackathons import router as hackathons_router
from app.routes.search import router as search_router
from app.routes.users import router as users_router
from app.routes.resources import router as resources_router

from app.services.hackathon_sync import start_background_sync

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title="Hackathon Finder API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://hackathon-finder-five.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(hackathons_router, prefix="/hackathons")
app.include_router(search_router, prefix="/search")
app.include_router(users_router, prefix="/users")
app.include_router(resources_router)


# Background sync management
_stop_event = asyncio.Event()
_background_task: asyncio.Task | None = None


@app.on_event("startup")
async def startup_event():
    """Start background sync on FastAPI startup."""
    global _background_task
    # Initialize MongoDB connection
    from app.database.mongodb import init_app as _init_db
    _init_db()
    logger.info("MongoDB connection initialized on startup")

    _background_task = asyncio.create_task(
        start_background_sync(_stop_event),
        name="hackathon_background_sync",
    )
    logger.info("Background hackathon sync task started on startup")


@app.on_event("shutdown")
async def shutdown_event():
    """Stop background sync on FastAPI shutdown."""
    global _background_task
    _stop_event.set()
    if _background_task is not None:
        _background_task.cancel()
        try:
            await _background_task
        except asyncio.CancelledError:
            pass
        _background_task = None
    logger.info("Background hackathon sync task stopped")


# Convenience: ensure DB is initialized when module is imported
from app.database.mongodb import init_app as _default_init
_default_init()
logger.info("Default MongoDB initialization completed on import")