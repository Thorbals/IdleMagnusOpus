@echo off
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port = 8771;" ^
  "$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue;" ^
  "if ($conn) {" ^
  "  $p = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue;" ^
  "  if ($p -and $p.ProcessName -match 'python|node') { Stop-Process -Id $p.Id -Force }" ^
  "}" ^
  "Start-Process node -ArgumentList 'tools/serve.mjs' -WorkingDirectory (Get-Location) -WindowStyle Hidden;" ^
  "Start-Sleep -Seconds 1;" ^
  "Start-Process ('http://127.0.0.1:' + $port + '/');"
