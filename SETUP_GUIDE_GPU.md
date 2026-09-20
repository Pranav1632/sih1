# Sentinel-Transform: Complete Setup & Deployment Guide for NVIDIA RTX 3050 / RTX 4050 GPUs

> **Target Environment**: Windows 10 / 11 (64-bit)  
> **Target Hardware**: NVIDIA GeForce RTX 3050 (4 GB / 6 GB) or RTX 4050 (6 GB) Laptop / Desktop GPU  
> **Security Policy**: 100% Sovereign Air-Gapped Operation (0 KB Cloud Telemetry / Zero External API Egress)  
> **Expected Performance**: **~35 to 45 seconds** total execution for 4 simultaneous deliverables (compared to ~8 minutes on CPU).

---

## Table of Contents
1. [System Architecture & GPU Acceleration Overview](#1-system-architecture--gpu-acceleration-overview)
2. [Hardware & Software Prerequisites](#2-hardware--software-prerequisites)
3. [Step 1: Verify NVIDIA Driver & CUDA Support](#step-1-verify-nvidia-driver--cuda-support)
4. [Step 2: Install Development Toolchains (Python, Node.js, Git)](#step-2-install-development-toolchains-python-nodejs-git)
5. [Step 3: Install & Configure Ollama for GPU Acceleration](#step-3-install--configure-ollama-for-gpu-acceleration)
6. [Step 4: Clone & Configure Repository](#step-4-clone--configure-repository)
7. [Step 5: Backend Environment Setup](#step-5-backend-environment-setup)
8. [Step 6: Frontend Environment Setup](#step-6-frontend-environment-setup)
9. [Step 7: Launching the System (Manual or 1-Click Script)](#step-7-launching-the-system-manual-or-1-click-script)
10. [Step 8: Verification & GPU Performance Benchmark](#step-8-verification--gpu-performance-benchmark)
11. [Troubleshooting & Common Fixes](#troubleshooting--common-fixes)

---

## 1. System Architecture & GPU Acceleration Overview

Sentinel-Transform is an intelligence transformation engine built for defense and enterprise workflows. It ingests complex multi-page PDF/DOCX reports, normalizes evidence chunks into an SQLite Source Evidence Index (SEI), extracts entities via spaCy NER, and generates 7 locked Pydantic schemas (Executive Briefing, PowerPoint slide deck with speaker scripts, Word advisory, LinkedIn thought-leadership, infographics, Twitter/X threads, and video packages).

```
   ┌───────────────────────┐
   │ Ingested PDF / DOCX   │
   └───────────┬───────────┘
               ▼
   ┌───────────────────────┐
   │ SQLite SEI Normalizer │  (Sub-2s chunking & coordinate indexing)
   └───────────┬───────────┘
               ▼
   ┌───────────────────────┐
   │   spaCy NER Engine    │  (Sub-1s local entity extraction: ORG, GPE, TECH)
   └───────────┬───────────┘
               ▼
   ┌────────────────────────────────────────────────────────┐
   │ NVIDIA GPU (RTX 3050 / 4050) + Ollama (qwen2.5:3b)    │
   │  - VRAM Footprint: ~2.4 GB (Fits 100% in VRAM)         │
   │  - Speed: 60 to 85 tokens/sec (15x faster than CPU)    │
   └───────────┬────────────────────────────────────────────┘
               ▼
   ┌───────────────────────┐
   │ 2-Pass Reflection     │  (Structural & 0-cloud-egress audit)
   └───────────┬───────────┘
               ▼
   ┌───────────────────────┐
   │ RapidFuzz Hard Gate   │  (Sub-10ms CPU verification & HTTP 423 lock)
   └───────────┬───────────┘
               ▼
   ┌───────────────────────┐
   │ Exporters (.pptx/.doc)│  (Deterministic python-pptx & docx compilation)
   └───────────────────────┘
```

### Why RTX 3050 / RTX 4050 is the Sweet Spot:
* `qwen2.5:3b` in 4-bit quantization (`Q4_K_M`) occupies only **~1.9 GB of VRAM**.
* The 4K context cache adds **~0.5 GB of VRAM**.
* Total VRAM footprint is **~2.4 GB**, which easily fits into the **4 GB or 6 GB VRAM** of an RTX 3050 or RTX 4050 with zero paging to system RAM.
* **Token speed**: ~65 to 80 tokens/second on RTX 3050/4050 vs ~4.5 tokens/second on CPU.

---

## 2. Hardware & Software Prerequisites

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 (64-bit, 21H2+) | Windows 11 (64-bit) |
| **GPU** | NVIDIA GeForce RTX 3050 (4 GB VRAM) | RTX 3050 (6 GB) or RTX 4050 (6 GB) |
| **NVIDIA Driver** | Version 535.xx or higher | Latest Game Ready / Studio Driver (550.xx+) |
| **System RAM** | 8 GB DDR4 / DDR5 | 16 GB DDR4 / DDR5 |
| **Free Storage** | 10 GB free space on SSD | 20 GB free space on NVMe SSD |
| **Python** | Python 3.10.x or 3.11.x | Python 3.11.9 (64-bit) |
| **Node.js** | Node.js v18 LTS | Node.js v20 LTS or v22 LTS |
| **Git** | Git for Windows (2.40+) | Latest Git for Windows |

---

## Step 1: Verify NVIDIA Driver & CUDA Support

1. Open **PowerShell** or **Command Prompt** and run:
   ```cmd
   nvidia-smi
   ```
2. You should see an output displaying your GPU:
   ```text
   +-----------------------------------------------------------------------------------------+
   | NVIDIA-SMI 555.99                 Driver Version: 555.99         CUDA Version: 12.5     |
   |-----------------------------------+------------------------+--------------------------+
   | GPU  Name                TCC/WDDM | Bus-Id          Disp.A | Volatile Uncorr. ECC     |
   | Fan  Temp   Perf          Pwr:Usage/Cap | Memory-Usage      | GPU-Util  Compute M.     |
   |===================================+========================+==========================|
   |   0  NVIDIA GeForce RTX 3050...   | 00000000:01:00.0   On  |                  N/A     |
   | N/A   48C    P8              N/A  |    420MiB /  4096MiB   |      0%      Default     |
   +-----------------------------------+------------------------+--------------------------+
   ```
3. If `nvidia-smi` is not recognized, download and install the latest driver from NVIDIA:
   * **URL**: [https://www.nvidia.com/Download/index.aspx](https://www.nvidia.com/Download/index.aspx)
   * Select your product: *GeForce RTX 30 Series (Notebooks)* or *RTX 40 Series*.
   * Install and restart your computer.

---

## Step 2: Install Development Toolchains (Python, Node.js, Git)

### 1. Install Python 3.11
* Download the **Python 3.11 Windows 64-bit installer**: [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
* ⚠️ **CRITICAL**: On the first installer screen, check the box:  
  **`[x] Add python.exe to PATH`**
* Click **Customize installation** -> check all optional features -> **Next** -> check **`Install for all users`** -> click **Install**.
* Verify in a new PowerShell window:
  ```powershell
  python --version
  # Output should be: Python 3.11.x
  ```

### 2. Install Node.js
* Download the **Node.js LTS installer (.msi)**: [https://nodejs.org/](https://nodejs.org/)
* Run the installer, accept defaults, and finish.
* Verify in PowerShell:
  ```powershell
  node -v
  npm -v
  ```

### 3. Install Git
* Download **Git for Windows**: [https://git-scm.com/download/win](https://git-scm.com/download/win)
* Run installer with standard defaults.

---

## Step 3: Install & Configure Ollama for GPU Acceleration

Ollama automatically detects your NVIDIA RTX GPU and uses CUDA for hardware acceleration without any manual CUDA toolkit installation.

1. Download **Ollama for Windows**:
   * **URL**: [https://ollama.com/download/windows](https://ollama.com/download/windows)
2. Run `OllamaSetup.exe` and complete installation.
3. Open a new PowerShell terminal and pull the target model (`qwen2.5:3b`):
   ```powershell
   ollama pull qwen2.5:3b
   ```
   *Size: ~1.9 GB. Download takes 1–3 minutes depending on internet speed.*

4. **Verify GPU Offloading**:
   Run a test prompt in PowerShell:
   ```powershell
   ollama run qwen2.5:3b "State your model name and describe AI safety in one sentence."
   ```
   While this is running, open a second PowerShell window and check `nvidia-smi`:
   ```powershell
   nvidia-smi
   ```
   You should see `ollama_llama_server.exe` using approximately **1800 MiB to 2400 MiB** of GPU VRAM!

---

## Step 4: Clone & Configure Repository

1. Open PowerShell and navigate to your preferred workspace directory (e.g., `D:\project` or `C:\project`):
   ```powershell
   cd D:\project
   git clone <YOUR_GIT_REPO_URL> sih
   cd sih
   ```

2. Create the local data storage directories:
   ```powershell
   mkdir -Force data
   mkdir -Force fixtures
   ```

3. (Optional) Create or inspect `.env` in the project root:
   ```ini
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL_DEV=qwen2.5:3b
   OLLAMA_MODEL_DEMO=qwen2.5:7b
   FASTAPI_PORT=8000
   ```

---

## Step 5: Backend Environment Setup

1. In the project root (`sih\`), create and activate a Python virtual environment:
   ```powershell
   # Create virtual environment
   python -m venv venv

   # Set execution policy to allow activating venv (run once if needed)
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned

   # Activate virtual environment
   .\venv\Scripts\Activate.ps1
   ```
   *(Your terminal prompt should now show `(venv)` at the beginning).*

2. Upgrade `pip` and install all required Python packages:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   pip install ollama
   ```

3. Download the spaCy English NLP model for local NER entity extraction:
   ```powershell
   python -m spacy download en_core_web_sm
   ```

4. Verify backend dependencies with a quick dry-run test:
   ```powershell
   python -c "import spacy, rapidfuzz, docx, pptx, fitz, ollama; print('All backend libraries imported successfully!')"
   ```

---

## Step 6: Frontend Environment Setup

1. Open a new PowerShell terminal and navigate to the `frontend` subfolder:
   ```powershell
   cd D:\project\sih\frontend
   ```

2. Install all Node.js dependencies:
   ```powershell
   npm install
   ```

3. Verify frontend build:
   ```powershell
   npm run build
   ```
   *(Should complete in ~5–7 seconds with `✓ built in ...` and 0 errors).*

---

## Step 7: Launching the System (Manual or 1-Click Script)

### Method A: One-Click Automation Script (Recommended)
Save the batch script provided in the repository root (`start_sentinel_gpu.bat`) or create it with the following content:

Double-click **`start_sentinel_gpu.bat`** or run:
```cmd
.\start_sentinel_gpu.bat
```
This automatically opens:
1. **Ollama Service** window.
2. **FastAPI Backend Daemon** on `http://127.0.0.1:8000`.
3. **Vite Frontend Server** on `http://localhost:5173`.
4. Automatically opens your default browser at `http://localhost:5173`.

---

### Method B: Manual 3-Terminal Startup

If you prefer to start services in separate terminals:

#### Terminal 1: Start Ollama Service
```powershell
ollama serve
```
*(Keep this window open. It listens on `http://localhost:11434`).*

#### Terminal 2: Start FastAPI Backend
```powershell
cd D:\project\sih
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 1
```
*(Should display: `Uvicorn running on http://127.0.0.1:8000`).*

#### Terminal 3: Start Vite Frontend
```powershell
cd D:\project\sih\frontend
npm run dev
```
*(Should display: `Local: http://localhost:5173/`).*

---

## Step 8: Verification & GPU Performance Benchmark

1. Open your browser at **`http://localhost:5173`**.
2. **Tab 1: Source Ingestion**:
   * Click **"Load Sample Intel"** or upload any PDF/DOCX report (e.g., `resume_f_8.pdf` or a government cyber report).
   * Notice the parameters on the right: Tone, Target Audience, Detail Level.
   * Select your deliverables: **Executive Summary**, **Presentation (.pptx)**, **LinkedIn**, and **Advisory**.
3. Click **"Execute Transformation (4 Formats)"**:
   * The UI automatically jumps to **Tab 2: Pipeline Working State**.
   * Watch the **Live LLM Token Stream** terminal panel stream tokens in green real-time characters.
   * Check **`nvidia-smi`** in a terminal — GPU utilization will spike to 60–90% as tokens are synthesized at **60 to 80 tokens/sec**.
4. **Benchmark Comparison**:
   * **CPU Only**: ~485 seconds (~8.1 minutes)
   * **RTX 3050 / RTX 4050 GPU**: **~35 to 45 seconds total!**
5. **Tab 3: Deliverable Outputs**:
   * Inspect the rich Markdown Executive Briefing.
   * Click **"Download .pptx"** to inspect the PowerPoint slide deck complete with presenter speaker notes.
   * Click **"Download .docx"** to inspect the formal formatted advisory.
6. **Tab 4: History & Archive**:
   * Click the new **"4. History & Archive"** tab in the top navbar.
   * Review past transformation sessions with input file names, timestamps, and interactive Q&A chat.

---

## Troubleshooting & Common Fixes

### 1. PowerShell Script Execution Policy Error
**Error**: `File ...\Activate.ps1 cannot be loaded because running scripts is disabled on this system.`  
**Fix**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 2. Ollama is Running on CPU Instead of GPU
**Symptoms**: Generation still takes 7–8 minutes; `nvidia-smi` shows 0% GPU utilization.  
**Fixes**:
1. Check your driver: update to NVIDIA driver 535+ from nvidia.com.
2. In PowerShell, restart Ollama:
   ```powershell
   Stop-Process -Name "ollama*" -Force
   ollama serve
   ```
3. Verify that your laptop is plugged into AC power (on battery power, Windows often forces laptops to use integrated Intel/AMD graphics to conserve power).
4. Set Windows Graphics preference:
   * Open **Windows Settings** -> **System** -> **Display** -> **Graphics**.
   * Find or add `ollama.exe` and `ollama_llama_server.exe` (usually in `C:\Users\<User>\AppData\Local\Programs\Ollama\`).
   * Click **Options** -> choose **High performance (NVIDIA GPU)**.

### 3. Port 8000 or 5173 Already in Use
**Fix**: Terminate the old zombie process in PowerShell:
```powershell
# For Port 8000 (Backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# For Port 5173 (Frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### 4. spaCy Model Not Found (`Can't find model 'en_core_web_sm'`)
**Fix**: Ensure your virtual environment is active, then run:
```powershell
.\venv\Scripts\Activate.ps1
python -m spacy download en_core_web_sm
```

### 5. Out of Memory (OOM) on 4 GB RTX 3050
If other applications (e.g. Chrome with 50 tabs, Photoshop, or games) are consuming GPU VRAM:
1. Check available VRAM in `nvidia-smi`.
2. Close VRAM-heavy apps before running generation.
3. `qwen2.5:3b` requires only **~2.4 GB VRAM**, leaving 1.6 GB headroom on a 4 GB card.

---

## Quick Reference Summary

| Service | Address | Start Command |
| :--- | :--- | :--- |
| **Ollama Local LLM** | `http://localhost:11434` | `ollama serve` |
| **FastAPI Backend** | `http://127.0.0.1:8000` | `python -m uvicorn backend.main:app --port 8000` |
| **Vite Web Dashboard** | `http://localhost:5173` | `npm run dev` (inside `frontend/`) |
| **Complete 1-Click Launch** | All 3 Services | `.\start_sentinel_gpu.bat` |
