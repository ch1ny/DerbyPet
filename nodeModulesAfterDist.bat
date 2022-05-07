@echo off
set platform=%1
set arch=%2
copy /y ".\ReadyUpdater.exe" ".\dist\DerbyPet-%platform%-%arch%\resources\ReadyUpdater.exe"
mkdir ".\dist\DerbyPet-%platform%-%arch%\resources\node_modules"
set need_modules="fs-extra" "graceful-fs"
(for %%m in (%need_modules%) do (
    echo d|xcopy /y /E ".\node_modules\%%m" ".\dist\DerbyPet-%platform%-%arch%\resources\node_modules\%%m"
))