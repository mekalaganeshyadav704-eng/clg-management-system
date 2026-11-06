@echo off
title AcademiaPro - Modern College ERP & Management System
color 0B
echo ========================================================================
echo   ACADEMIAPRO - MODERN COLLEGE ERP & CAMPUS MANAGEMENT SYSTEM
echo ========================================================================
echo.
echo [1/3] Initializing SQLite Database (college_erp.db)...
python "%~dp0init_db.py"
echo.
echo [2/3] Launching Fast Backend REST API Server...
start "AcademiaPro SQL Backend" python "%~dp0server.py"
timeout /t 1 /nobreak >nul
echo.
echo [3/3] Opening College ERP in your web browser...
start "" "http://127.0.0.1:8000/index.html"
echo.
echo ========================================================================
echo  * SQL Backend is LIVE at: http://127.0.0.1:8000
echo  * SQLite Database is active: college_erp.db
echo  * Web UI is open in your browser!
echo  * Ready for Lab External Exam Demonstration.
echo ========================================================================
echo.
pause
