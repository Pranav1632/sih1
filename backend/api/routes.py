import os
import json
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["Sentinel-Transform API"])

# Directory for job export artifacts
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
FIXTURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "fixtures"))
os.makedirs(DATA_DIR, exist_ok=True)

# In-memory store for jobs in skeleton / mock mode
JOB_STORE: Dict[str, Dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    job_id: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    requested_formats: List[str] = Field(default_factory=list)


class ReviewConfirmRequest(BaseModel):
    job_id: str
    human_approved: bool = Field(default=False)
    human_corrections: Dict[str, Any] = Field(default_factory=dict)


def _load_mock_chunks() -> List[Dict[str, Any]]:
    fixture_path = os.path.join(FIXTURES_DIR, "mock_source_chunks.json")
    if os.path.exists(fixture_path):
        with open(fixture_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return [
        {
            "chunk_id": "chunk_01",
            "doc_id": "doc_01",
            "source_name": "sample_report.pdf",
            "source_role": "PRIMARY",
            "page_number": 1,
            "text": "Sample baseline intelligence chunk.",
            "extracted_entities": []
        }
    ]


@router.post("/ingest")
async def ingest_files(
    files: List[UploadFile] = File(...),
    source_role: Optional[str] = Form("PRIMARY")
):
    """
    POST /api/ingest
    Accepts multipart files + source_role per file.
    Returns {job_id, source_chunks[]} per BUILD.md contract.
    """
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    saved_files = []

    for file in files:
        file_path = os.path.join(DATA_DIR, f"{job_id}_{file.filename}")
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        saved_files.append({"filename": file.filename, "path": file_path, "role": source_role})

    # Return schema-conformant source chunks
    source_chunks = _load_mock_chunks()

    JOB_STORE[job_id] = {
        "job_id": job_id,
        "files": saved_files,
        "source_chunks": source_chunks,
        "status": "ingested",
        "hard_gate_triggered": False,
        "human_approved": False,
        "entity_discrepancies": [],
        "draft_outputs": {},
        "exported_files": {}
    }

    return {
        "job_id": job_id,
        "source_chunks": source_chunks
    }


@router.post("/generate")
async def generate_outputs(request: GenerateRequest):
    """
    POST /api/generate
    Accepts {job_id, parameters, requested_formats}.
    Returns {job_id, status}.
    """
    job_id = request.job_id
    if job_id not in JOB_STORE:
        # Auto-initialize if called directly
        JOB_STORE[job_id] = {
            "job_id": job_id,
            "status": "generating",
            "hard_gate_triggered": False,
            "human_approved": False,
            "entity_discrepancies": [],
            "parameters": request.parameters,
            "requested_formats": request.requested_formats
        }
    else:
        JOB_STORE[job_id]["status"] = "generating"
        JOB_STORE[job_id]["parameters"] = request.parameters
        JOB_STORE[job_id]["requested_formats"] = request.requested_formats

    return {
        "job_id": job_id,
        "status": "processing"
    }


@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """
    GET /api/status/{job_id}
    Returns {status, hard_gate_triggered, entity_discrepancies[]}.
    """
    job = JOB_STORE.get(job_id)
    if not job:
        # Return sensible default for client polling on unknown job
        return {
            "status": "not_found",
            "hard_gate_triggered": False,
            "entity_discrepancies": []
        }

    return {
        "status": job.get("status", "pending"),
        "hard_gate_triggered": job.get("hard_gate_triggered", False),
        "entity_discrepancies": job.get("entity_discrepancies", [])
    }


@router.post("/review/confirm")
async def review_confirm(request: ReviewConfirmRequest):
    """
    POST /api/review/confirm
    Accepts {job_id, human_approved, human_corrections}.
    Returns {status}.
    """
    job_id = request.job_id
    job = JOB_STORE.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found."
        )

    job["human_approved"] = request.human_approved
    job["human_corrections"] = request.human_corrections
    job["status"] = "resumed" if request.human_approved else "rejected"

    return {
        "status": job["status"]
    }


@router.get("/export/{format_type}/{job_id}")
async def export_deliverable(format_type: str, job_id: str):
    """
    GET /api/export/{format}/{job_id}
    Returns file download (.pptx/.docx).
    """
    job = JOB_STORE.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found."
        )

    normalized_fmt = format_type.lower()
    if normalized_fmt in ["pptx", "presentation"]:
        ext = "pptx"
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    elif normalized_fmt in ["docx", "advisory"]:
        ext = "docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export format: {format_type}. Supported: pptx, docx"
        )

    file_path = os.path.join(DATA_DIR, f"{job_id}_export.{ext}")

    # If file doesn't exist yet, create mock file placeholder
    if not os.path.exists(file_path):
        with open(file_path, "wb") as f:
            f.write(b"MOCK_EXPORT_FILE_CONTENT")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=f"sentinel_{job_id}.{ext}"
    )
