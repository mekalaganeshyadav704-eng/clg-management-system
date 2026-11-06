@echo off
title AcademiaPro - SQL Backend & REST API Server
color 0A
echo ========================================================================
echo   ACADEMIAPRO - PYTHON + SQLITE REST API BACKEND SERVER
echo ========================================================================
echo.
echo [*] Checking SQLite Database...
python "%~dp0init_db.py"
echo.
echo [*] Launching REST API Server on http://127.0.0.1:8000 ...
echo [*] Database Engine: SQLite ANSI SQL (college_erp.db)
echo [*] Press Ctrl+C at any time to stop the server.
echo.
python "%~dp0server.py"
pause
