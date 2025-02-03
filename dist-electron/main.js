import { nativeImage, ipcMain, app, BrowserWindow, session, desktopCapturer, Tray, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require2 = createRequire(import.meta.url);
const robot = require2("robotjs");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
const trayIcon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, "icon", "icon.png"));
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: trayIcon,
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.toggleDevTools();
  ipcMain.on("close-win", (event) => {
    win.minimize();
    let timer = setInterval(() => {
      if (win == null ? void 0 : win.isMinimized()) {
        setTimeout(() => {
          clearInterval(timer);
          event.returnValue = "";
        }, 50);
      }
    }, 10);
  });
  win.webContents.on("destroyed", () => {
    app.quit();
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  return win;
}
function createPickWindow(imageUrl) {
  const win2 = new BrowserWindow({
    icon: trayIcon,
    transparent: true,
    frame: false,
    // 关闭窗口边框
    alwaysOnTop: true,
    // 确保窗口始终在最上面
    // skipTaskbar: true, // 不显示在任务栏
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
    win2.loadURL(`file://${__dirname}/../dist/index.html#/pick`);
  }
  win2.webContents.on("dom-ready", () => {
    win2.webContents.send("get-screen-img", { imageUrl });
  });
  win2.setFullScreen(true);
  win2.setAlwaysOnTop(true, "screen-saver");
  return win2;
}
ipcMain.on("create-pick-win", (e, { imageUrl }) => {
  const pickWin = createPickWindow(imageUrl);
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
  const win2 = createWindow();
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      robot.moveMouse(1e4, 1e4);
      callback({ video: sources[0], audio: "loopback" });
    });
  });
  let appIcon = new Tray(trayIcon);
  appIcon.on("double-click", () => {
    win2.show();
  });
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      type: "normal",
      click: () => {
        app.quit();
      }
    },
    {
      label: "显示主页面",
      type: "normal",
      click: () => {
        win2.show();
      }
    }
  ]);
  appIcon.setContextMenu(contextMenu);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
