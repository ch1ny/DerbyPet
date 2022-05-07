copy /y ".\builtPackage.json" ".\build\package.json"
copy /y ".\main.js" ".\build\main.js"
echo d|xcopy /y /E ".\public\electronAssets" ".\build\electronAssets"