@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale o Node.js LTS pelo site https://nodejs.org e abra este arquivo novamente.
 pause
 exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"
if errorlevel 1 (
 echo Atualize para Node.js 20 ou superior pelo site https://nodejs.org
 pause
 exit /b 1
)
set ZIMONS_OPEN_BROWSER=1
echo ZIMONS - iniciando o jogo...
echo Mantenha esta janela aberta enquanto joga.
node tools\server.mjs
pause
