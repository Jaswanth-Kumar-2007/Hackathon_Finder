from datetime import datetime
from mongoengine import Document, StringField, DateTimeField, ListField, DecimalField


def normalize_date_value(value) -> str | None:
    """Normalize a date value to ISO string, or return None if invalid."""
    if value is None or value == "" or value is None:
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


def normalize_number_value(value) -> float | None:
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


class Hackathon(Document):
    """MongoDB document for normalized hackathon data."""

    title = StringField()
    organizer = StringField()
    platform = StringField()
    description = StringField()
    url = StringField()  # Official hackathon event URL
    source_url = StringField()  # Original SerpApi/scraped source URL
    start_date = StringField()  # ISO format, nullable
    end_date = StringField()  # ISO format, nullable
    registration_deadline = StringField()  # ISO format, nullable
    mode = StringField()  # Online, Offline, Hybrid
    location = StringField()
    eligibility = ListField(StringField(), default=[])
    team_size_min = DecimalField(default=1)
    team_size_max = DecimalField(default=1)
    prize = DecimalField(default=None, nullable=True)
    categories = ListField(StringField(), default=[])
    technologies = ListField(StringField(), default=[])
    platform_source = StringField()  # Platform where discovered (Devpost, etc.)
    discovered_url = StringField(unique=True, help_text="Stable URL-based identifier for dedup")
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "hackathons",
        "index_together": [["platform", "discovered_url"], ["url"]],
        "indexes": [
            "platform",
            "start_date",
            "end_date",
            "mode",
            "prize",
        ],
    }

    def to_response(self):
        """Convert to API response format."""
        return {
            "id": str(self.id),
            "title": self.title or None,
            "organizer": self.organizer or None,
            "platform": self.platform or None,
            "description": self.description or None,
            "url": self.url or None,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "registration_deadline": self.registration_deadline,
            "mode": self.mode,
            "location": self.location or None,
            "eligibility": self.eligibility or None,
            "team_size": (
                {"min": float(self.team_size_min), "max": float(self.team_size_max)}
                if self.team_size_min is not None
                else None
            ),
            "prize": normalize_number_value(self.prize),
            "categories": self.categories or None,
            "technologies": self.technologies or None,
            "official_url": self.url,
            "source_url": self.source_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @staticmethod
    def from_normalized(normalized_data: dict, source_url: str, platform: str) -> "Hackathon":
        """Create a Hackathon instance from normalized data.

        Args:
            normalized_data: Dict from the normalization pipeline
            source_url: The original URL that was scraped
            platform: The platform name (Devpost, HackerEarth, etc.)

        Returns:
            Hackathon document instance
        """
        # Extract team size - handle both dict and number formats
        team_size_min = 1
        team_size_max = 1
        ts = normalized_data.get("team_size")
        if ts:
            if isinstance(ts, dict):
                team_size_min = ts.get("min", 1)
                team_size_max = ts.get("max", 1)
            elif isinstance(ts, (int, float)):
                team_size_min = ts
                team_size_max = ts

        # Normalize dates
        start_date = normalize_date_value(normalized_data.get("start_date"))
        end_date = normalize_date_value(normalized_data.get("end_date"))
        reg_deadline = normalize_date_value(normalized_data.get("registration_deadline"))

        # Normalize prize
        prize = normalize_number_value(normalized_data.get("prize"))

        # Normalize eligibility
        eligibility = normalized_data.get("eligibility") or []

        # Normalize categories
        categories = normalized_data.get("categories") or []

        # Normalize technologies
        technologies = normalized_data.get("technologies") or []

        return Hackathon(
            title=normalized_data.get("title"),
            organizer=normalized_data.get("organizer"),
            platform=platform or normalized_data.get("platform"),
            description=normalized_data.get("description"),
            url=normalized_data.get("url"),
            source_url=source_url,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=reg_deadline,
            mode=normalized_data.get("mode"),
            location=normalized_data.get("location"),
            eligibility=eligibility,
            team_size_min=Decimal(str(team_size_min)) if team_size_min is not None else Decimal("1"),
            team_size_max=Decimal(str(team_size_max)) if team_size_max is not None else Decimal("1"),
            prize=prize,
            categories=categories,
            technologies=technologies,
            platform_source=platform,
            discovered_url=normalized_data.get("url") or source_url,
        )

    def update_from_normalized(self, normalized_data: dict, source_url: str, platform: str):
        """Update this document from normalized data (for dedup updates).

        Only updates fields that have non-null values in the normalized data,
        preserving existing values if the new data has null for a field.
        """
        # Update title if new data has it
        if normalized_data.get("title") is not None:
            self.title = normalized_data["title"]

        # Update organizer if new data has it
        if normalized_data.get("organizer") is not None:
            self.organizer = normalized_data["organizer"]

        # Update description if new data has it
        if normalized_data.get("description") is not None:
            self.description = normalized_data["description"]

        # Update dates if new data has non-null values
        start_date = normalize_date_value(normalized_data.get("start_date"))
        if start_date is not None:
            self.start_date = start_date

        end_date = normalize_date_value(normalized_data.get("end_date"))
        if end_date is not None:
            self.end_date = end_date

        reg_deadline = normalize_date_value(normalized_data.get("registration_deadline"))
        if reg_deadline is not None:
            self.registration_deadline = reg_deadline

        # Update mode if new data has it
        if normalized_data.get("mode") is not None:
            self.mode = normalized_data["mode"]

        # Update location if new data has it
        if normalized_data.get("location") is not None:
            self.location = normalized_data["location"]

        # Update eligibility if new data has it (and existing is empty)
        new_eligibility = normalized_data.get("eligibility") or []
        if new_eligibility and not self.eligibility:
            self.eligibility = new_eligibility

        # Update team size if new data has it
        ts = normalized_data.get("team_size")
        if ts is not None:
            if isinstance(ts, dict):
                self.team_size_min = Decimal(str(ts.get("min", 1)))
                self.team_size_max = Decimal(str(ts.get("max", 1)))
            elif isinstance(ts, (int, float)):
                self.team_size_min = Decimal(str(ts))
                self.team_size_max = Decimal(str(ts))

        # Update prize if new data has non-null value
        prize = normalize_number_value(normalized_data.get("prize"))
        if prize is not None:
            self.prize = prize

        # Update categories if new data has it (and existing is empty)
        new_categories = normalized_data.get("categories") or []
        if new_categories and not self.categories:
            self.categories = new_categories

        # Update technologies if new data has it (and existing is empty)
        new_technologies = normalized_data.get("technologies") or []
        if new_technologies and not self.technologies:
            self.technologies = new_technologies

        # Update platform source if changed
        if normalized_data.get("platform") is not None:
            self.platform = normalized_data["platform"]

        # Update source URL
        self.source_url = source_url

        # Always update the discovered URL for dedup
        self.discovered_url = normalized_data.get("url") or source_url

        # Update timestamp
        self.updated_at = datetime.utcnow()