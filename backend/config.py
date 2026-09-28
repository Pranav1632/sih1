"""
backend/config.py - Application configuration and environment variables.
Owned by: Orchestration Lead.
Loads all environment variables defined in BUILD.md.
"""

import os
from pathlib import Path
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Base project directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env if present
load_dotenv(BASE_DIR / ".env")


class Settings(BaseModel):
    # Local Ollama endpoint (zero cloud egress)
    OLLAMA_HOST: str = Field(
        default_factory=lambda: os.getenv("OLLAMA_HOST", "http://localhost:11434")
    )

    # Development model for local CPU execution
    OLLAMA_MODEL_DEV: str = Field(
        default_factory=lambda: os.getenv("OLLAMA_MODEL_DEV", "qwen2.5:7b")
    )

    # Demo model for deployment
    OLLAMA_MODEL_DEMO: str = Field(
        default_factory=lambda: os.getenv("OLLAMA_MODEL_DEMO", "qwen2.5:7b")
    )

    # SQLite Source Evidence Index path
    SQLITE_DB_PATH: str = Field(
        default_factory=lambda: os.getenv("SQLITE_DB_PATH", str(BASE_DIR / "data" / "sentinel.db"))
    )

    # FastAPI server port
    FASTAPI_PORT: int = Field(
        default_factory=lambda: int(os.getenv("FASTAPI_PORT", "8000"))
    )


settings = Settings()
