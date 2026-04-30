@echo off
title Nexus Terminal V3 Setup
echo ========================================
echo      INSTALACION INICIAL DE NEXUS
echo ========================================
echo.
echo [1/3] Configurando Python Backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Configurando React Frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Sincronizando Git...
git pull origin main

echo.
echo ========================================
echo INSTALACION COMPLETADA CON EXITO.
echo Ahora puedes usar INICIAR_NEXUS.bat
echo ========================================
pause
