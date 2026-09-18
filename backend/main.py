from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(
    title="Sentinel-Transform API",
    description="Air-gapped, sovereign multi-format intelligence transformation platform",
    version="1.0.0"
)

# CORS configuration for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  # Air-gapped local development fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all 5 endpoints from API table
app.include_router(router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Air-gapped health check endpoint."""
    return {"status": "healthy", "service": "sentinel-transform-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
