@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js 20 ou superior e abra este arquivo novamente.
 pause
 exit /b 1
)
echo Abra http://localhost:4173 no navegador.
echo Mantenha esta janela aberta enquanto joga.
node tools\server.mjs
pause
