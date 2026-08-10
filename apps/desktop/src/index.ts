import { app, BrowserWindow, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) app.quit();

let apiProcess: ChildProcess | null = null;
let webProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

function findResource(rel: string): string {
  const candidates = [
    path.join(process.resourcesPath || '', rel),
    path.join(path.dirname(process.execPath), 'resources', rel),
    path.join(__dirname, '../../../../', rel),
    path.join(__dirname, '../../../', rel),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        console.log(`[✓] ${rel} => ${p}`);
        return p;
      }
    } catch {}
  }
  console.error(`[✗] NOT FOUND: ${rel}`);
  return candidates[0];
}

function waitForPort(port: number, retries = 40): Promise<boolean> {
  return new Promise((resolve) => {
    let n = 0;
    const check = () => {
      const req = http.get(
        { hostname: '127.0.0.1', port, path: '/', timeout: 1000 },
        () => resolve(true)
      );
      req.on('error', () => { if (++n < retries) setTimeout(check, 1000); else resolve(false); });
      req.on('timeout', () => req.destroy());
      req.end();
    };
    setTimeout(check, 1000);
  });
}

function startService(script: string, cwd: string, env: object, label: string): ChildProcess {
  console.log(`[${label}] spawn: ${script}`);
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

async function startApp(): Promise<void> {
  createWindow();

  if (!app.isPackaged) {
    // Dev: โหลด loading screen จาก webpack ก่อน
    mainWindow?.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    const ready = await waitForPort(3000, 15);
    console.log('[DEV] Next.js ready:', ready);
    mainWindow?.loadURL('http://localhost:3000');
    return;
  }

  // Production: โหลด loading screen จาก webpack ก่อน
  mainWindow?.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  const apiScript = findResource('apps/api/dist/src/main.js');
  const webScript = findResource('apps/web/.next/standalone/server.js');
  const webCwd    = findResource('apps/web/.next/standalone');

  // รัน API
  apiProcess = startService(
    apiScript,
    path.dirname(apiScript),
    { NODE_ENV: 'production' },
    'API'
  );
  const apiReady = await waitForPort(3001, 20);
  console.log('[PROD] API ready:', apiReady);

  // รัน Web
  webProcess = startService(
    webScript,
    webCwd,
    { NODE_ENV: 'production', PORT: '3000', HOSTNAME: '127.0.0.1' },
    'WEB'
  );
  const webReady = await waitForPort(3000, 30);
  console.log('[PROD] Web ready:', webReady);

  // navigate ไปหน้าจริง — ตอนนี้อยู่บน webpack URL แล้ว navigate ไป http ได้
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
