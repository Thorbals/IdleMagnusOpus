@echo off
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = 8771;" ^
  "$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue;" ^
  "if (-not $listening) {" ^
  "  Start-Process python -ArgumentList '-m','http.server',$port,'--bind','127.0.0.1' -WorkingDirectory (Get-Location) -WindowStyle Hidden;" ^
  "  Start-Sleep -Seconds 2;" ^
  "}" ^
  "Start-Process ('http://127.0.0.1:' + $port + '/');"
