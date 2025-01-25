import { ipcMain, app, BrowserWindow, session, desktopCapturer } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  console.log();
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.toggleDevTools();
  ipcMain.on("close-win", (event) => {
    win.minimize();
    event.returnValue = "";
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  return win;
}
function createPickWindow() {
  const win2 = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    transparent: true,
    frame: false,
    // 关闭窗口边框
    alwaysOnTop: true,
    // 确保窗口始终在最上面
    skipTaskbar: true,
    // 不显示在任务栏
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win2.webContents.toggleDevTools();
  ipcMain.on("close-screen", () => {
    win2.destroy();
  });
  if (VITE_DEV_SERVER_URL) {
    win2.loadURL(VITE_DEV_SERVER_URL + "#/pick");
  } else {
    win2.loadFile(path.join(RENDERER_DIST, "index.html#/pick"));
  }
  win2.setFullScreen(true);
  return win2;
}
ipcMain.on("create-pick-win", (e, { imageUrl }) => {
  const pickWin = createPickWindow();
  pickWin.focus();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    console.log(request);
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: "loopback" });
    });
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
