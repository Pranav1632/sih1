"""
backend/ingestion/sei_store.py - SQLite Source Evidence Index (SEI) Store.
Owned by: Ingestion Engineer (Task 1).

Provides persistence and query capabilities for coordinate-aware source chunks
matching the exact schema specified in BUILD.md and fixtures/mock_source_chunks.json.
"""

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from backend.config import settings
    DEFAULT_DB_PATH = settings.SQLITE_DB_PATH
except ImportError:
    DEFAULT_DB_PATH = "./data/sentinel.db"


class SEIStore:
    """
    SQLite-backed Source Evidence Index store for physical coordinate-indexed chunks.
    Ensures zero field loss on insert and retrieval.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path if db_path is not None else DEFAULT_DB_PATH
        self._memory_conn: Optional[sqlite3.Connection] = None
        if self.db_path == ":memory:":
            self._memory_conn = sqlite3.connect(":memory:")
            self._memory_conn.row_factory = sqlite3.Row
        self._ensure_db_dir()
        self.init_db()

    def _ensure_db_dir(self) -> None:
        """Ensure parent directory exists for file-backed SQLite database."""
        if self.db_path and self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

    def _get_connection(self) -> sqlite3.Connection:
        if self._memory_conn is not None:
            return self._memory_conn
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        """Initializes the SQLite schema for source_chunks."""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS source_chunks (
            chunk_id TEXT PRIMARY KEY,
            doc_id TEXT NOT NULL,
            source_name TEXT NOT NULL,
            source_role TEXT NOT NULL,
            page_number INTEGER,
            timestamp_start REAL,
            timestamp_end REAL,
            char_start INTEGER NOT NULL,
            char_end INTEGER NOT NULL,
            text TEXT NOT NULL,
            extracted_entities TEXT NOT NULL,
            authority_weight REAL DEFAULT 1.0,
            metadata TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_doc_id ON source_chunks(doc_id);
        CREATE INDEX IF NOT EXISTS idx_source_role ON source_chunks(source_role);
        """
        with self._get_connection() as conn:
            conn.executescript(create_table_sql)
            conn.commit()

    def insert_chunk(self, chunk: Dict[str, Any]) -> None:
        """Insert or replace a single chunk in the SEI store."""
        self.insert_chunks([chunk])

    def insert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Inserts multiple chunks into the SEI store in a single transaction.
        Preserves all coordinates, roles, and JSON-serialized entity structures.
        """
        if not chunks:
            return 0

        sql = """
        INSERT OR REPLACE INTO source_chunks (
            chunk_id, doc_id, source_name, source_role,
            page_number, timestamp_start, timestamp_end,
            char_start, char_end, text, extracted_entities,
            authority_weight, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        rows = []
        for c in chunks:
            extracted_entities = c.get("extracted_entities", [])
            if not isinstance(extracted_entities, str):
                extracted_entities_str = json.dumps(extracted_entities)
            else:
                extracted_entities_str = extracted_entities

            metadata = c.get("metadata", {})
            if not isinstance(metadata, str):
                metadata_str = json.dumps(metadata)
            else:
                metadata_str = metadata

            rows.append((
                str(c["chunk_id"]),
                str(c["doc_id"]),
                str(c.get("source_name", "")),
                str(c.get("source_role", "SUPPORTING")),
                c.get("page_number"),
                c.get("timestamp_start"),
                c.get("timestamp_end"),
                int(c.get("char_start", 0)),
                int(c.get("char_end", 0)),
                str(c.get("text", "")),
                extracted_entities_str,
                float(c.get("authority_weight", 1.0 if c.get("source_role") == "PRIMARY" else 0.5)),
                metadata_str
            ))

        with self._get_connection() as conn:
            conn.executemany(sql, rows)
            conn.commit()

        return len(rows)

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Convert a sqlite3.Row to chunk dictionary matching fixture schema."""
        d = dict(row)
        try:
            d["extracted_entities"] = json.loads(d["extracted_entities"])
        except (json.JSONDecodeError, TypeError):
            d["extracted_entities"] = []

        if d.get("metadata"):
            try:
                d["metadata"] = json.loads(d["metadata"])
            except (json.JSONDecodeError, TypeError):
                d["metadata"] = {}
        else:
            d.pop("metadata", None)

        return d

    def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific chunk by its chunk_id."""
        sql = "SELECT * FROM source_chunks WHERE chunk_id = ?"
        with self._get_connection() as conn:
            cursor = conn.execute(sql, (chunk_id,))
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def get_chunks_by_doc(self, doc_id: str) -> List[Dict[str, Any]]:
        """Retrieve all chunks associated with a specific doc_id."""
        sql = """
        SELECT * FROM source_chunks 
        WHERE doc_id = ? 
        ORDER BY page_number ASC, char_start ASC
        """
        with self._get_connection() as conn:
            cursor = conn.execute(sql, (doc_id,))
            return [self._row_to_dict(row) for row in cursor.fetchall()]

    def get_all_chunks(self) -> List[Dict[str, Any]]:
        """Retrieve all chunks in the SEI store."""
        sql = "SELECT * FROM source_chunks ORDER BY doc_id ASC, page_number ASC, char_start ASC"
        with self._get_connection() as conn:
            cursor = conn.execute(sql)
            return [self._row_to_dict(row) for row in cursor.fetchall()]

    def get_chunks_by_role(self, source_role: str) -> List[Dict[str, Any]]:
        """Retrieve all chunks with a specific source_role (e.g. PRIMARY, SUPPORTING)."""
        sql = "SELECT * FROM source_chunks WHERE source_role = ? ORDER BY doc_id ASC, page_number ASC, char_start ASC"
        with self._get_connection() as conn:
            cursor = conn.execute(sql, (source_role,))
            return [self._row_to_dict(row) for row in cursor.fetchall()]

    def count_chunks(self) -> int:
        """Returns the total number of chunks stored."""
        sql = "SELECT COUNT(*) FROM source_chunks"
        with self._get_connection() as conn:
            cursor = conn.execute(sql)
            return cursor.fetchone()[0]

    def clear_store(self) -> None:
        """Deletes all records from source_chunks."""
        with self._get_connection() as conn:
            conn.execute("DELETE FROM source_chunks")
            conn.commit()
