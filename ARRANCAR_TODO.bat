@echo off
title Lanzador Maestro Nexus
echo ========================================
echo       NEXUS TERMINAL V3 - INICIANDO
echo ========================================
echo.

:: Iniciar el backend silenciosamente en otra consola
start "NEXUS BACKEND" cmd /c "cd backend && venv\Scripts\activate && uvicorn main:app --reload"
echo [OK] Backend de IA y Datos arrancando...

:: Iniciar el frontend silenciosamente en otra consola
start "NEXUS FRONTEND" cmd /c "cd frontend && npm run dev"
echo [OK] Interfaz grafica de React arrancando...

echo.
echo Esperando 3 segundos a que los servidores esten listos...
timeout /t 3 > nul

:: Abrir el navegador automaticamente
echo Abriendo Nexus en tu navegador...
start http://localhost:5173

echo.
echo ¡Todo esta listo! Puedes minimizar esta ventana negra.
pause
