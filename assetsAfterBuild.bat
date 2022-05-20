copy /y ".\builtPackage.json" ".\build\package.json"
echo d|xcopy /y /E ".\electron" ".\build\electron"
echo d|xcopy /y /E ".\public\electronAssets" ".\build\electronAssets"