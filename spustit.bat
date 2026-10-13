@echo off
rem Spusti aplikaciu na tomto pocitaci: http://localhost:8080
cd /d "%~dp0"
echo Aktualizujem udaje z webu obce...
python scripts\update_data.py
echo.
echo Aplikacia bezi na http://localhost:8080  (zastavite ju zatvorenim tohto okna)
start "" http://localhost:8080
python -m http.server 8080
