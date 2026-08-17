@echo off
chcp 65001 > nul
title Future Shop - Database Import
color 0B

net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo  =====================================================
echo    Future Shop - Step 2: Database Import
echo    localbazaar_backup.sql import hobe
echo  =====================================================
echo.

set "SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f=$env:SELF; $c=[IO.File]::ReadAllText($f,[Text.Encoding]::UTF8); $i=$c.IndexOf('#PS_START'); $ps=$c.Substring($i+9); $tmp=[IO.Path]::GetTempFileName()+'.ps1'; [IO.File]::WriteAllText($tmp,$ps,[Text.Encoding]::UTF8); try { & $tmp } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }"
exit /b

#PS_START
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = "Future Shop - Database Import"

function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Info($msg) { Write-Host "  [>]  $msg" -ForegroundColor White }
function Write-Err($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  ======================================================" -ForegroundColor Cyan
Write-Host "   Future Shop - Database Import" -ForegroundColor Cyan
Write-Host "  ======================================================" -ForegroundColor Cyan
Write-Host ""

# Find project path
$desktop     = [Environment]::GetFolderPath("Desktop")
$projectPath = Join-Path $desktop "Future-Shop"

# ---- Check .env files ----
Write-Host "  [ CHECK ] .env Files" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray

$backendEnv  = Join-Path $projectPath "backend\.env"
$frontendEnv = Join-Path $projectPath "frontend\.env.local"

if (Test-Path $backendEnv) {
    Write-OK "backend\.env found"
} else {
    Write-Err "backend\.env NOT FOUND!"
    Write-Warn "Old PC theke copy korun: backend\.env"
    Write-Warn "Path: $backendEnv"
}

if (Test-Path $frontendEnv) {
    Write-OK "frontend\.env.local found"
} else {
    Write-Err "frontend\.env.local NOT FOUND!"
    Write-Warn "Old PC theke copy korun: frontend\.env.local"
}

if (-not (Test-Path $backendEnv)) {
    Write-Host ""
    Write-Err ".env file nai! Prothome copy korun, tahole import korun."
    Read-Host "Enter press kore exit korun"
    exit 1
}

# ---- Find SQL backup file ----
Write-Host ""
Write-Host "  [ CHECK ] Database Backup SQL File" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray

# Check common locations
$sqlPaths = @(
    (Join-Path $projectPath "localbazaar_backup.sql"),
    (Join-Path $desktop "localbazaar_backup.sql"),
    "C:\localbazaar_backup.sql"
)

$sqlFile = $null
foreach ($p in $sqlPaths) {
    if (Test-Path $p) {
        $sqlFile = $p
        Write-OK "SQL file found: $p"
        break
    }
}

if (-not $sqlFile) {
    Write-Warn "SQL backup file automatic find kora jachche na."
    Write-Host ""
    $input = Read-Host "  SQL file er full path likun (e.g. C:\Users\...\localbazaar_backup.sql)"
    if (Test-Path $input) {
        $sqlFile = $input
        Write-OK "File found: $sqlFile"
    } else {
        Write-Err "File pawa jachche na! Old PC theke localbazaar_backup.sql copy korun."
        Read-Host "Enter press kore exit korun"
        exit 1
    }
}

# ---- Read DB credentials from .env ----
Write-Host ""
Write-Host "  [ SETUP ] Database Configuration" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray

$envContent = Get-Content $backendEnv -Raw
$dbName = if ($envContent -match 'DB_DATABASE=(.+)') { $Matches[1].Trim() } else { "localbazaar" }
$dbUser = if ($envContent -match 'DB_USERNAME=(.+)') { $Matches[1].Trim() } else { "postgres" }
$dbPass = if ($envContent -match 'DB_PASSWORD=(.+)') { $Matches[1].Trim() } else { "Ashik" }
$dbPort = if ($envContent -match 'DB_PORT=(.+)') { $Matches[1].Trim() } else { "5432" }

Write-Info "Database : $dbName"
Write-Info "User     : $dbUser"
Write-Info "Port     : $dbPort"

$env:PGPASSWORD = $dbPass

# Find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    (Get-Command psql -ErrorAction SilentlyContinue).Source
) | Where-Object { $_ -and (Test-Path $_) }

if ($psqlPaths.Count -eq 0) {
    Write-Err "psql.exe pawa jachche na! PostgreSQL install hoyeche?"
    Write-Warn "01_Setup-FutureShop.bat aage chalun!"
    Read-Host "Enter press kore exit korun"
    exit 1
}
$psql = $psqlPaths[0]
Write-OK "psql found: $psql"

# ---- Create database ----
Write-Host ""
Write-Host "  [ CREATE ] Database: $dbName" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray

Write-Info "Database create korার চেষ্টা করা হচ্ছে..."
$createCmd = "CREATE DATABASE $dbName;"
& $psql -U $dbUser -h 127.0.0.1 -p $dbPort -c $createCmd postgres 2>&1 | ForEach-Object {
    if ($_ -like "*already exists*") {
        Write-Warn "Database already exists - existing data thakbe"
    } elseif ($_ -like "*ERROR*") {
        Write-Warn "Note: $_"
    } else {
        Write-OK "Database created: $dbName"
    }
}

# ---- Import SQL ----
Write-Host ""
Write-Host "  [ IMPORT ] SQL Backup Import" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray
Write-Info "Importing... (ektu time lagbe)"

$result = & $psql -U $dbUser -h 127.0.0.1 -p $dbPort -d $dbName -f $sqlFile 2>&1
$errors = $result | Where-Object { $_ -like "*ERROR*" }

if ($errors.Count -eq 0) {
    Write-OK "Database import successful!"
} else {
    Write-Warn "Import complete with some notes:"
    $errors | Select-Object -First 5 | ForEach-Object { Write-Warn $_ }
}

# ---- Laravel setup ----
Write-Host ""
Write-Host "  [ SETUP ] Laravel Final Setup" -ForegroundColor Cyan
Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray

Push-Location (Join-Path $projectPath "backend")
Write-Info "Generating App Key..."
php artisan key:generate 2>&1 | Select-Object -Last 1
Write-Info "Creating storage link..."
php artisan storage:link 2>&1 | Select-Object -Last 1
Write-Info "Running migrations (if any new)..."
php artisan migrate --force 2>&1 | Select-Object -Last 3
Write-OK "Laravel setup done!"
Pop-Location

# ---- Done! ----
Write-Host ""
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host "   DATABASE IMPORT COMPLETE!" -ForegroundColor Green
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Ekhon server chalate:" -ForegroundColor Yellow
Write-Host "  03_Start-Servers.bat chalun!" -ForegroundColor Cyan
Write-Host ""
Read-Host "  Enter press kore exit korun"
