from datetime import datetime
from mongoengine import Document, EmailField, StringField, ListField, DateTimeField


class User(Document):
    name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    interests = ListField(StringField(), default=[])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "users",
        "index_together": [["email"]],
    }

    def to_response(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "interests": self.interests,
        }


def unique_id(email: str) -> str:
    """Generate a stable identifier from email for dedup purposes."""
    import hashlib
    return hashlib.sha256(email.lower().encode()).hexdigest()[:20]