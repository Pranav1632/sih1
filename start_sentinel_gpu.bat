@echo off
TITLE Sentinel-Transform Sovereign Launcher (NVIDIA RTX 3050/4050)
COLOR 0A

echo ===============================================================================
echo     SENTINEL-TRANSFORM: SOVEREIGN MULTI-FORMAT INTELLIGENCE PLATFORM
echo            Hardware Accelerated for NVIDIA RTX 3050 / RTX 4050
echo ===============================================================================
echo.

:: 1. Check NVIDIA GPU status
echo [*] Checking NVIDIA GPU status...
where nvidia-smi >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] WARNING: nvidia-smi not found in PATH. Make sure NVIDIA Drivers are installed!
) else (
    echo [+] NVIDIA Driver detected.
)
echo.

:: 2. Launch Ollama Service in background
echo [*] Starting Local Ollama Daemon...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [+] Ollama service is already running.
) else (
    start "Sentinel - Ollama Service" /min cmd /c "ollama serve"
    timeout /t 2 >nul
)
echo.

:: 3. Launch Backend
echo [*] Starting FastAPI Backend on http://127.0.0.1:8000...
if exist "venv\Scripts\activate.bat" (
    start "Sentinel - Backend Engine" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 1"
) else (
    start "Sentinel - Backend Engine" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 1"
)
timeout /t 3 >nul
echo.

:: 4. Launch Frontend
echo [*] Starting Vite Frontend Dashboard on http://localhost:5173...
cd frontend
start "Sentinel - Frontend UI" cmd /k "npm run dev"
cd ..
timeout /t 3 >nul
echo.

:: 5. Open Web Browser
echo [*] Opening Web Dashboard at http://localhost:5173...
start http://localhost:5173

echo ===============================================================================
echo  [+] ALL 3 SERVICES ARE NOW RUNNING!
echo      1. Ollama LLM:      http://localhost:11434 (qwen2.5:3b with CUDA)
echo      2. FastAPI Backend: http://127.0.0.1:8000 (0 KB egress)
echo      3. Web Dashboard:   http://localhost:5173
echo.
echo  Keep the opened terminal windows running while using Sentinel-Transform.
echo ===============================================================================
pause
