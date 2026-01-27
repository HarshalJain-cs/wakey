@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\electron@28.1.0\node_modules\electron\node_modules;C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\electron@28.1.0\node_modules;C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\electron@28.1.0\node_modules\electron\node_modules;C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\electron@28.1.0\node_modules;C:\Users\Admin\Desktop\dev\wakey\wakey\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\electron\cli.js" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\electron\cli.js" %*
)
