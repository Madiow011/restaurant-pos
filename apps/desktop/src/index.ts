import { app, BrowserWindow, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) app.quit();

let apiProcess: ChildProcess | null = null;
let webProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function getResourcePath(rel: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, rel);
  }
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    try {
      const pkg = require(path.join(dir, 'package.json'));
      if (pkg.name === 'restaurant-pos') return path.join(dir, rel);
    } catch {}
    dir = path.dirname(dir);
  }
  return path.join(__dirname, '../../../../', rel);
}

function waitForPort(port: number, retries = 40): Promise<boolean> {
  return new Promise((resolve) => {
    let n = 0;
    const check = () => {
      const req = http.get({ hostname: '127.0.0.1', port, path: '/', timeout: 1000 }, () => {
        resolve(true);
      });
      req.on('error', () => { if (++n < retries) setTimeout(check, 1000); else resolve(false); });
      req.on('timeout', () => req.destroy());
      req.end();
    };
    setTimeout(check, 1500);
  });
}

// Splash window แยกต่างหาก ใช้ http protocol ตั้งแต่แรก
function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: '#0f172a',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  splashWindow.loadURL(`data:text/html;base64,${Buffer.from(`
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{margin:0;background:#0f172a;color:#fff;font-family:'Segoe UI',sans-serif;
display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:16px}
.icon{font-size:56px}.title{font-size:24px;font-weight:700}.sub{font-size:13px;color:#94a3b8}
.bar{width:240px;height:5px;background:#1e293b;border-radius:3px;overflow:hidden;margin-top:4px}
.fill{height:100%;background:#4f46e5;border-radius:3px;animation:ld 1.6s ease-in-out infinite}
@keyframes ld{0%{width:5%}60%{width:80%}100%{width:95%}}
</style></head>
<body>
<div class="icon">🍽️</div>
<div class="title">Restaurant POS</div>
<div class="sub">กำลังเริ่มระบบ กรุณารอสักครู่...</div>
<div class="bar"><div class="fill"></div></div>
</body></html>
  `).toString('base64')}`);
}

// Main window โหลด http โดยตรง ไม่ผ่าน file://
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Restaurant POS',
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startService(script: string, cwd: string, env: object, label: string): ChildProcess {
  console.log(`[${label}] Starting: ${script}`);
  const proc = spawn(process.execPath, [script], {
    cwd,
    env: { ...process.env, ...env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'pipe',
  });
  proc.stdout?.on('data', (d) => console.log(`[${label}]`, d.toString().trim()));
  proc.stderr?.on('data', (d) => console.error(`[${label}!]`, d.toString().trim()));
  proc.on('error', (e) => console.error(`[${label}] error:`, e.message));
  return proc;
}

async function startApp(): Promise<void> {
  // แสดง splash ก่อน
  createSplashWindow();

  if (!app.isPackaged) {
    // Dev mode: รอ Next.js dev server
    createMainWindow();
    const ready = await waitForPort(3000, 15);
    console.log('[DEV] Next.js ready:', ready);
    
    // ซ่อน splash, แสดง main
    splashWindow?.close();
    splashWindow = null;
    
    mainWindow?.loadURL('http://localhost:3000');
    mainWindow?.show();
    return;
  }

  // Production mode
  const apiScript = getResourcePath('apps/api/dist/src/main.js');
  const apiCwd    = getResourcePath('apps/api');
  const webScript = getResourcePath('apps/web/.next/standalone/server.js');
  const webCwd    = getResourcePath('apps/web');

  console.log('[PROD] resourcesPath:', process.resourcesPath);
  console.log('[PROD] apiScript:', apiScript, 'exists:', fs.existsSync(apiScript));
  console.log('[PROD] webScript:', webScript, 'exists:', fs.existsSync(webScript));

  // รัน API
  apiProcess = startService(apiScript, apiCwd, { NODE_ENV: 'production' }, 'API');
  await waitForPort(3001, 20);

  // รัน Web
  webProcess = startService(webScript, webCwd, {
    NODE_ENV: 'production',
    PORT: '3000',
    HOSTNAME: '127.0.0.1',
  }, 'WEB');

  const webReady = await waitForPort(3000, 30);
  console.log('[PROD] Web ready:', webReady);

  // สร้าง main window และโหลด URL โดยตรง
  createMainWindow();

  mainWindow?.once('ready-to-show', () => {
    splashWindow?.close();
    splashWindow = null;
    mainWindow?.show();
  });

  mainWindow?.loadURL('http://127.0.0.1:3000');
}

app.on('ready', startApp);
app.on('window-all-closed', () => {
  apiProcess?.kill();
  webProcess?.kill();
  if (process.platform !== 'darwin') app.quit();
});
app.on('before-quit', () => {
  apiProcess?.kill();
  webProcess?.kill();
});
