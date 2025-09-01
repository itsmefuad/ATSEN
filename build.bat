@echo off
echo Cleaning previous build...
cd /d "%~dp0"
if exist "backend\public\assets" (
    rmdir /s /q "backend\public\assets"
)
if exist "backend\public\index.html" (
    del "backend\public\index.html"
)

echo Building frontend...
cd frontend
call npm install
call npm run build

echo Installing backend dependencies...
cd ..\backend
call npm install

echo Build completed successfully!
echo Ready for deployment with commands:
echo   Build: npm run build
echo   Start: npm run start
