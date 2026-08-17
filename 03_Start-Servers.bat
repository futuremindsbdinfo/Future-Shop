@echo off
chcp 65001 > nul
title Future Shop - Servers Running
color 0A

echo.
echo  =====================================================
echo    Future Shop - Step 3: Start Servers
echo    Backend + Frontend duto chalbe
echo  =====================================================
echo.

set "SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f=$env:SELF; $c=[IO.File]::ReadAllText($f,[Text.Encoding]::UTF8); $i=$c.IndexOf('#PS_START'); $ps=$c.Substring($i+9); $tmp=[IO.Path]::GetTempFileName()+'.ps1'; [IO.File]::WriteAllText($tmp,$ps,[Text.Encoding]::UTF8); try { & $tmp } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }"
exit /b

#PS_START
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Future Shop - Servers"

$desktop     = [Environment]::GetFolderPath("Desktop")
$projectPath = Join-Path $desktop "Future-Shop"
$backendPath = Join-Path $projectPath "backend"
$frontendPath= Join-Path $projectPath "frontend"

Write-Host ""
Write-Host "  Starting Backend (Laravel)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$backendPath`" && php artisan serve" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "  Starting Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$frontendPath`" && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host "   SERVERS STARTED!" -ForegroundColor Green
Write-Host "  ======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Website   : http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "  Browser a open korte 30 seconds wait korun..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Read-Host "  Servers chalu ache. Bondho korte 2 ta terminal window close korun. Enter press korun..."
