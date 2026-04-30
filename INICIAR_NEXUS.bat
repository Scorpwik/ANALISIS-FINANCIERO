@echo off
title Nexus Terminal V3 Launcher
echo ========================================
echo        NEXUS TERMINAL V3 - STARTUP
echo ========================================
echo.
echo [1/2] Iniciando Servidor de Datos (Backend)...
start "NEXUS BACKEND" cmd /c "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

echo [2/2] Iniciando Interfaz Grafica (Frontend)...
start "NEXUS FRONTEND" cmd /c "cd frontend && npm run dev"

echo.
echo ----------------------------------------
echo SERVIDORES EN MARCHA. 
echo La web estara disponible en: http://localhost:5173
echo ----------------------------------------
echo No cierres las ventanas negras mientras uses la app.
echo.
pause
