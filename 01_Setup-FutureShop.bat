@echo off
chcp 65001 > nul
title Future Shop - Auto Setup
color 0A

:: ============================================
:: Admin check - not admin hole re-launch korbe
:: ============================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Admin permission dorkar. Re-launching...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo  =====================================================
echo    Future Shop - Step 1: Software Install
echo    Git, Node.js, PHP, Composer, PostgreSQL
echo    sob auto install hobe...
echo  =====================================================
echo.

set "SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f=$env:SELF; $c=[IO.File]::ReadAllText($f,[Text.Encoding]::UTF8); $i=$c.IndexOf('#PS_START'); $ps=$c.Substring($i+9); $tmp=[IO.Path]::GetTempFileName()+'.ps1'; [IO.File]::WriteAllText($tmp,$ps,[Text.Encoding]::UTF8); try { & $tmp } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }"
exit /b

#PS_START
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$ErrorActionPreference = 'Continue'
$Host.UI.RawUI.WindowTitle = "Future Shop - Auto Setup"

function Write-Step($n, $total, $msg) {
    Write-Host ""
    Write-Host "  [ STEP $n/$total ] $msg" -ForegroundColor Cyan
    Write-Host ("  " + "-" * 48) -ForegroundColor DarkGray
}
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Info($msg) { Write-Host "  [>]  $msg" -ForegroundColor White }

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
}

function Install-App($id, $name) {
    Write-Info "Installing $name..."
    winget install --id $id -e --accept-package-agreements --accept-source-agreements --silent 2>&1 | Out-Null
    Refresh-Path
    Write-OK "$name OK"
}

function Check-Cmd($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Host ""
Write-Host "  ======================================================" -ForegroundColor Blue
Write-Host "   Future Shop - Automatic Setup Script" -ForegroundColor Blue
Write-Host "  ======================================================" -ForegroundColor Blue

# ------- STEP 1: winget check -------
Write-Step "1" "8" "System Check (winget)"
if (-not (Check-Cmd "winget")) {
    Write-Host "  [X] winget not found! Windows update dorkar." -ForegroundColor Red
    Write-Host "  Download: https://aka.ms/getwinget" -ForegroundColor Yellow
    Read-Host "Enter press kore exit korun"
    exit 1
}
$wv = winget --version 2>&1
Write-OK "winget found: $wv"

# ------- STEP 2: Git -------
Write-Step "2" "8" "Git Install"
if (Check-Cmd "git") {
    $v = git --version 2>&1
    Write-OK "Already installed: $v"
} else {
    Install-App "Git.Git" "Git"
}

# ------- STEP 3: Node.js -------
Write-Step "3" "8" "Node.js LTS Install"
if (Check-Cmd "node") {
    $v = node --version 2>&1
    Write-OK "Already installed: $v"
} else {
    Install-App "OpenJS.NodeJS.LTS" "Node.js LTS"
}

# ------- STEP 4: PHP -------
Write-Step "4" "8" "PHP 8.2 Install"
if (Check-Cmd "php") {
    Write-OK "PHP already installed"
} else {
    Install-App "PHP.PHP" "PHP 8.2"
    Refresh-Path
}

# PHP extensions enable
Write-Info "PHP extensions enable korা হচ্ছে..."
$phpExe = (Get-Command php -ErrorAction SilentlyContinue).Source
if ($phpExe) {
    $phpDir  = Split-Path $phpExe
    $phpIni  = Join-Path $phpDir "php.ini"
    if (-not (Test-Path $phpIni)) {
        $iniDev = Join-Path $phpDir "php.ini-development"
        if (Test-Path $iniDev) { Copy-Item $iniDev $phpIni }
    }
    if (Test-Path $phpIni) {
        $content = Get-Content $phpIni -Raw
        foreach ($ext in @('pdo_pgsql','pgsql','zip','fileinfo','gd','mbstring','openssl','curl','sodium')) {
            $content = $content -replace ";extension=$ext", "extension=$ext"
        }
        Set-Content $phpIni $content -Encoding UTF8
        Write-OK "Extensions enabled: pdo_pgsql, pgsql, zip, gd, curl, openssl"
    } else {
        Write-Warn "php.ini not found - manually enable extensions!"
    }
}

# ------- STEP 5: Composer -------
Write-Step "5" "8" "Composer Install"
if (Check-Cmd "composer") {
    Write-OK "Composer already installed"
} else {
    Install-App "Composer.Composer" "Composer"
}

# ------- STEP 6: PostgreSQL -------
Write-Step "6" "8" "PostgreSQL 16 Install"
$pgBin = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (Test-Path $pgBin) {
    Write-OK "PostgreSQL already installed"
} else {
    Write-Info "Downloading PostgreSQL 16 installer (150MB)..."
    $pgUrl  = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64.exe"
    $pgFile = Join-Path $env:TEMP "postgresql-installer.exe"
    try {
        $wc = New-Object System.Net.WebClient
        $wc.DownloadFile($pgUrl, $pgFile)
        Write-OK "Download complete"
        Write-Info "Installing... (2-3 minutes lagte pare)"
        $pgArgs = "--mode unattended --superpassword Ashik --servicename postgresql-16 --servicepassword Ashik --serverport 5432 --disable-components pgAdmin,stackbuilder"
        Start-Process $pgFile -ArgumentList $pgArgs -Wait -NoNewWindow
        Remove-Item $pgFile -ErrorAction SilentlyContinue
        $pgPath = "C:\Program Files\PostgreSQL\16\bin"
        if (Test-Path $pgPath) {
            $mp = [System.Environment]::GetEnvironmentVariable("Path","Machine")
            if ($mp -notlike "*postgresql*") {
                [System.Environment]::SetEnvironmentVariable("Path","$mp;$pgPath","Machine")
            }
            $env:Path = "$env:Path;$pgPath"
        }
        Write-OK "PostgreSQL 16 installed! (Password: Ashik)"
    } catch {
        Write-Warn "Download failed! Install manually: https://www.postgresql.org/download/windows"
        Write-Warn "Installation password must be: Ashik"
    }
}

# ------- STEP 7: Project Clone -------
Write-Step "7" "8" "Project Clone (GitHub)"
$desktop     = [Environment]::GetFolderPath("Desktop")
$projectPath = Join-Path $desktop "Future-Shop"

if (Test-Path $projectPath) {
    Write-Info "Already exists. Pulling latest..."
    Push-Location $projectPath
    git pull
    Pop-Location
    Write-OK "Project updated"
} else {
    Write-Info "Cloning from GitHub..."
    git clone "https://github.com/futuremindsbdinfo/Future-Shop.git" $projectPath
    Write-OK "Cloned to: $projectPath"
}

# ------- STEP 8: Dependencies -------
Write-Step "8" "8" "Project Dependencies Install"

Write-Info "Backend (Laravel/Composer) installing..."
Push-Location (Join-Path $projectPath "backend")
composer install --no-interaction --prefer-dist --optimize-autoloader 2>&1 | Tee-Object -Variable cOut | Select-Object -Last 3
Write-OK "Backend done"
Pop-Location

Write-Info "Frontend (Next.js/npm) installing..."
Push-Location (Join-Path $projectPath "frontend")
npm install 2>&1 | Select-Object -Last 5
Write-OK "Frontend done"
Pop-Location

# ------- DONE -------
Write-Host ""
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host "   STEP 1 COMPLETE! Software + Project ready!" -ForegroundColor Green
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Project folder: $projectPath" -ForegroundColor White
Write-Host ""
Write-Host "  EKHON KORTE HOBE:" -ForegroundColor Yellow
Write-Host "  1.  backend\.env       copy korun (old PC theke)" -ForegroundColor White
Write-Host "  2.  frontend\.env.local copy korun (old PC theke)" -ForegroundColor White
Write-Host "  3.  localbazaar_backup.sql copy korun (old PC theke)" -ForegroundColor White
Write-Host ""
Write-Host "  Shob copy hoye gele:" -ForegroundColor Cyan
Write-Host "  02_Import-Database.bat chalun" -ForegroundColor Cyan
Write-Host ""
Read-Host "  Enter press kore exit korun"
