@echo off
title Push to GitHub - AcademiaPro ERP
color 0B
echo ========================================================================
echo   PUSH TO GITHUB: mekalaganeshyadav704-eng/clg-management-system
echo ========================================================================
echo.
echo [*] Attempting git push...
git push -u origin main
if %ERRORLEVEL% EQU 0 goto success

echo.
echo ========================================================================
echo   GitHub Authentication Required
echo ========================================================================
echo GitHub requires a Personal Access Token instead of a password.
echo.
echo If you have your GitHub Personal Access Token (starts with ghp_...),
echo paste it below and press Enter:
echo.
set /p GHTOKEN="Enter GitHub Token (or press Enter to cancel): "

if not "%GHTOKEN%"=="" (
    echo.
    echo [*] Pushing with your token...
    git push https://%GHTOKEN%@github.com/mekalaganeshyadav704-eng/clg-management-system.git main
    if %ERRORLEVEL% EQU 0 goto success
    echo [ERROR] Token authentication failed. Make sure the token has 'repo' permissions.
    goto end
)

:success
echo.
echo ========================================================================
echo  [SUCCESS] All code pushed successfully to GitHub!
echo  URL: https://github.com/mekalaganeshyadav704-eng/clg-management-system
echo ========================================================================

:end
echo.
pause
