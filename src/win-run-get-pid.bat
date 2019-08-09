@echo off
for /f "tokens=2 delims==; " %%a in (' wmic process call create %1 ^| find "ProcessId" ') do set PID=%%a
echo "%PID%"