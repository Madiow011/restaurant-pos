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

function waitForPort(port: number, retries = 30): Promise<boolean> {
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
    setTimeout(check, 1000);
  });
}

function startService(script: string, cwd: string, env: object, label: string): ChildProcess {
  console.log(`[${label}] script=${script} cwd=${cwd}`);
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

function createWindow(): void {
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

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function startApp(): Promise<void> {
  createWindow();

  // โหลด loading.html จากไฟล์จริง — ไม่ใช้ data: URL
  const loadingHtml = path.join(__dirname, 'loading.html');
  if (fs.existsSync(loadingHtml)) {
    await mainWindow?.loadFile(loadingHtml);
  }

  if (!app.isPackaged) {
    // Dev mode
    const ready = await waitForPort(3000, 15);
    console.log('[DEV] Next.js ready:', ready);
    mainWindow?.loadURL('http://localhost:3000');
    return;
  }

  // Production
  const apiScript = getResourcePath('apps/api/dist/src/main.js');
  const apiCwd    = getResourcePath('apps/api');
  const webScript = getResourcePath('apps/web/.next/standalone/server.js');
  const webCwd    = getResourcePath('apps/web');

  if (!fs.existsSync(apiScript)) console.error('[!] API not built:', apiScript);
  if (!fs.existsSync(webScript)) console.error('[!] Web not built:', webScript);

  apiProcess = startService(apiScript, apiCwd, { NODE_ENV: 'production' }, 'API');
  await waitForPort(3001, 20);

  webProcess = startService(webScript, webCwd, {
    NODE_ENV: 'production',
    PORT: '3000',
    HOSTNAME: '127.0.0.1',
  }, 'WEB');

  const webReady = await waitForPort(3000, 30);
  console.log('[PROD] Web ready:', webReady);

  // navigate ไปหน้าจริง
  mainWindow?.loadURL('http://127.0.0.1:3000');
}

app.on('ready', startApp);
app.on('window-all-closed', () => {
  apiProcess?.kill(); webProcess?.kill();
  if (process.platform !== 'darwin') app.quit();
});
app.on('before-quit', () => { apiProcess?.kill(); webProcess?.kill(); });
