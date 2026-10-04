import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# MongoDB URI from environment variable
_mongo_uri = os.getenv("MONGODB_URI")

# MongoDB client - lazy initialization
_client = None
_db = None

# Logger
logger = logging.getLogger(__name__)


def init_app():
    """Initialize MongoDB connection when the app starts."""
    global _client, _db

    if _client is None:
        if not _mongo_uri:
            logger.warning("MONGODB_URI not set - MongoDB features will be disabled")
            return False

        try:
            _client = MongoClient(_mongo_uri, serverSelectionTimeoutMS=5000)
            # Test connection
            _client.admin.command("ping")
            _db = _client.get_default_database()
            logger.info("Connected to MongoDB successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            _client = None
            _db = None
            return False


def close_db():
    """Close MongoDB connection when the app shuts down."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed")


def get_db():
    """Get the database instance, initializing if needed."""
    global _client, _db
    if _db is None:
        init_app()
    return _db


def get_collection(name: str):
    """Get a collection by name, initializing DB if needed."""
    db = get_db()
    if db is None:
        logger.error("Database not initialized - MongoDB not available")
        return None
    return db[name]


# Collection accessors


def hackathons():
    """Get the hackathons collection."""
    return get_collection("Hackathon_Finder")

def users():
    """Get the users collection."""
    return get_collection("users")


def saved_hackathons():
    """Get the saved_hackathons collection."""
    return get_collection("saved_hackathons")