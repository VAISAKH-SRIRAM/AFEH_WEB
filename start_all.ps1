# Startup Script for AFEH_PWA
$ErrorActionPreference = "Stop"

Write-Host "Starting AFEH_PWA setup..." -ForegroundColor Cyan

# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing backend dependencies..."
pip install -r requirements.txt

# Frontend Setup
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

Write-Host "Installing frontend dependencies..."
npm install

# Start processes
Write-Host "Starting servers in parallel..." -ForegroundColor Green

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; & '.\venv\Scripts\Activate.ps1'; uvicorn server:app --reload --port 8000"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "Servers are starting in new windows." -ForegroundColor Cyan
