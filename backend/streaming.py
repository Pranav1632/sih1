"""
backend/streaming.py - Thread-safe in-memory streaming buffer for LLM token SSE.
Generator node pushes token chunks here; SSE route reads them out.
"""
import threading
from typing import Dict, List, Any

_lock = threading.Lock()

# job_id -> list of SSE event dicts
_buffers: Dict[str, List[Dict[str, Any]]] = {}
_done: Dict[str, bool] = {}


def init_job(job_id: str) -> None:
    with _lock:
        _buffers[job_id] = []
        _done[job_id] = False


def push_token(job_id: str, fmt: str, text: str) -> None:
    with _lock:
        if job_id in _buffers:
            _buffers[job_id].append({"type": "token", "format": fmt, "text": text})


def push_event(job_id: str, event_type: str, **kwargs) -> None:
    """Push a structured event (format_start, format_done, pipeline_done, error)."""
    with _lock:
        if job_id in _buffers:
            _buffers[job_id].append({"type": event_type, **kwargs})


def mark_done(job_id: str) -> None:
    with _lock:
        _done[job_id] = True


def read_from(job_id: str, offset: int):
    """Return (events_slice, is_done) from the given offset."""
    with _lock:
        buf = _buffers.get(job_id, [])
        return buf[offset:], _done.get(job_id, False)


def cleanup(job_id: str) -> None:
    with _lock:
        _buffers.pop(job_id, None)
        _done.pop(job_id, None)
