"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const node_module = require("node:module");
const node_url = require("node:url");
const path$2 = require("node:path");
const require$$0 = require("path");
const require$$1 = require("child_process");
const require$$2 = require("util");
const require$$0$1 = require("os");
const require$$1$1 = require("fs");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
var fontList = {};
var standardize$1 = function(fonts, options) {
  fonts = fonts.map((i) => {
    try {
      i = i.replace(/\\u([\da-f]{4})/ig, (m, s) => String.fromCharCode(parseInt(s, 16)));
    } catch (e) {
      console.log(e);
    }
    if (options && options.disableQuoting) {
      if (i.startsWith('"') && i.endsWith('"')) {
        i = `${i.substr(1, i.length - 2)}`;
      }
    } else if (i.match(/[\s()+]/) && !i.startsWith('"')) {
      i = `"${i}"`;
    }
    return i;
  });
  return fonts;
};
const path$1 = require$$0;
const execFile$1 = require$$1.execFile;
const exec$2 = require$$1.exec;
const util$2 = require$$2;
const pexec$1 = util$2.promisify(exec$2);
const bin = path$1.join(__dirname, "fontlist");
const font_exceptions = ["iconfont"];
async function getBySystemProfiler() {
  const cmd = `system_profiler SPFontsDataType | grep "Family:" | awk -F: '{print $2}' | sort | uniq`;
  const { stdout } = await pexec$1(cmd, { maxBuffer: 1024 * 1024 * 10 });
  return stdout.split("\n").map((f) => f.trim()).filter((f) => !!f);
}
async function getByExecFile() {
  return new Promise(async (resolve, reject) => {
    execFile$1(bin, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      let fonts = [];
      if (stdout) {
        fonts = fonts.concat(stdout.split("\n"));
      }
      if (stderr) {
        console.error(stderr);
      }
      fonts = Array.from(new Set(fonts)).filter((i) => i && !font_exceptions.includes(i));
      resolve(fonts);
    });
  });
}
var darwin = async () => {
  let fonts = [];
  try {
    fonts = await getByExecFile();
  } catch (e) {
    console.error(e);
  }
  if (fonts.length === 0) {
    try {
      fonts = await getBySystemProfiler();
    } catch (e) {
      console.error(e);
    }
  }
  return fonts;
};
const exec$1 = require$$1.exec;
const parse = (str) => {
  return str.split("\n").map((ln) => ln.trim()).filter((f) => !!f);
};
var getByPowerShell$1 = () => new Promise((resolve, reject) => {
  let cmd = `chcp 65001|powershell -command "chcp 65001|Out-Null;Add-Type -AssemblyName PresentationCore;$families=[Windows.Media.Fonts]::SystemFontFamilies;foreach($family in $families){$name='';if(!$family.FamilyNames.TryGetValue([Windows.Markup.XmlLanguage]::GetLanguage('zh-cn'),[ref]$name)){$name=$family.FamilyNames[[Windows.Markup.XmlLanguage]::GetLanguage('en-us')]}echo $name}"`;
  exec$1(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(parse(stdout));
  });
});
const os$1 = require$$0$1;
const fs = require$$1$1;
const path = require$$0;
const execFile = require$$1.execFile;
const util$1 = require$$2;
const p_copyFile = util$1.promisify(fs.copyFile);
function tryToGetFonts(s) {
  let a = s.split("\n");
  if (a[0].includes("Microsoft")) {
    a.splice(0, 3);
  }
  a = a.map((i) => {
    i = i.split("	")[0].split(path.sep);
    i = i[i.length - 1];
    if (!i.match(/^[\w\s]+$/)) {
      i = "";
    }
    i = i.replace(/^\s+|\s+$/g, "").replace(/(Regular|常规)$/i, "").replace(/^\s+|\s+$/g, "");
    return i;
  });
  return a.filter((i) => i);
}
async function writeToTmpDir(fn) {
  let tmp_fn = path.join(os$1.tmpdir(), "node-font-list-fonts.vbs");
  await p_copyFile(fn, tmp_fn);
  return tmp_fn;
}
var getByVBS$1 = async () => {
  let fn = path.join(__dirname, "fonts.vbs");
  const is_in_asar = fn.includes("app.asar");
  if (is_in_asar) {
    fn = await writeToTmpDir(fn);
  }
  return new Promise((resolve, reject) => {
    let cmd = `cscript`;
    execFile(cmd, [fn], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      let fonts = [];
      if (err) {
        reject(err);
        return;
      }
      if (stdout) {
        fonts = fonts.concat(tryToGetFonts(stdout));
      }
      if (stderr) {
        fonts = fonts.concat(tryToGetFonts(stderr));
      }
      resolve(fonts);
    });
  });
};
const os = require$$0$1;
const getByPowerShell = getByPowerShell$1;
const getByVBS = getByVBS$1;
const methods_new = [getByPowerShell, getByVBS];
const methods_old = [getByVBS, getByPowerShell];
var win32 = async () => {
  let fonts = [];
  let os_v = parseInt(os.release());
  let methods = os_v >= 10 ? methods_new : methods_old;
  for (let method of methods) {
    try {
      fonts = await method();
      if (fonts.length > 0) break;
    } catch (e) {
      console.log(e);
    }
  }
  return fonts;
};
const exec = require$$1.exec;
const util = require$$2;
const pexec = util.promisify(exec);
async function binaryExists(binary) {
  const { stdout } = await pexec(`whereis ${binary}`);
  return stdout.length > binary.length + 2;
}
var linux = async () => {
  const fcListBinary = await binaryExists("fc-list") ? "fc-list" : "fc-list2";
  const cmd = fcListBinary + ' -f "%{family[0]}\\n"';
  const { stdout } = await pexec(cmd, { maxBuffer: 1024 * 1024 * 10 });
  const fonts = stdout.split("\n").filter((f) => !!f);
  return Array.from(new Set(fonts));
};
const standardize = standardize$1;
const platform = process.platform;
let getFontsFunc;
switch (platform) {
  case "darwin":
    getFontsFunc = darwin;
    break;
  case "win32":
    getFontsFunc = win32;
    break;
  case "linux":
    getFontsFunc = linux;
    break;
  default:
    throw new Error(`Error: font-list can not run on ${platform}.`);
}
const defaultOptions = {
  disableQuoting: false
};
fontList.getFonts = async (options) => {
  options = Object.assign({}, defaultOptions, options);
  let fonts = await getFontsFunc();
  fonts = standardize(fonts, options);
  fonts.sort((a, b) => {
    return a.replace(/^['"]+/, "").toLocaleLowerCase() < b.replace(/^['"]+/, "").toLocaleLowerCase() ? -1 : 1;
  });
  return fonts;
};
const require$1 = node_module.createRequire(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const robot = require$1("robotjs");
const __dirname$1 = path$2.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
process.env.APP_ROOT = path$2.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$2.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$2.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$2.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
const trayIcon = electron.nativeImage.createFromPath(path$2.join(process.env.VITE_PUBLIC, "icon", "icon.png"));
let win;
function createWindow() {
  win = new electron.BrowserWindow({
    icon: trayIcon,
    // frame: false,
    webPreferences: {
      preload: path$2.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.toggleDevTools();
  electron.ipcMain.on("close-win", (event) => {
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
  electron.ipcMain.handle("get-font-list", () => {
    return new Promise((resolve, reject) => {
      fontList.getFonts().then((fonts) => {
        resolve(fonts);
      }).catch((err) => {
        console.log(err);
      });
    });
  });
  win.webContents.on("destroyed", () => {
    electron.app.quit();
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$2.join(RENDERER_DIST, "index.html"));
  }
  return win;
}
function createPickWindow(imageUrl) {
  const win2 = new electron.BrowserWindow({
    icon: trayIcon,
    transparent: true,
    frame: false,
    // 关闭窗口边框
    alwaysOnTop: true,
    // 确保窗口始终在最上面
    // skipTaskbar: true, // 不显示在任务栏
    resizable: false,
    webPreferences: {
      preload: path$2.join(__dirname$1, "preload.mjs")
    }
  });
  win2.webContents.toggleDevTools();
  electron.ipcMain.on("close-screen", () => {
    win2.destroy();
  });
  if (VITE_DEV_SERVER_URL) {
    win2.loadURL(VITE_DEV_SERVER_URL + "#/pick");
  } else {
    win2.loadURL(`file://${__dirname$1}/../dist/index.html#/pick`);
  }
  win2.webContents.on("dom-ready", () => {
    win2.webContents.send("get-screen-img", { imageUrl });
  });
  win2.setFullScreen(true);
  win2.setAlwaysOnTop(true, "screen-saver");
  return win2;
}
electron.ipcMain.on("create-pick-win", (e, { imageUrl }) => {
  const pickWin = createPickWindow(imageUrl);
  pickWin.focus();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(() => {
  const win2 = createWindow();
  electron.session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    electron.desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      robot.moveMouse(1e4, 1e4);
      callback({ video: sources[0], audio: "loopback" });
    });
  });
  let appIcon = new electron.Tray(trayIcon);
  appIcon.on("double-click", () => {
    win2.show();
  });
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: "退出",
      type: "normal",
      click: () => {
        electron.app.quit();
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
  appIcon.setToolTip("大牛马工具箱");
});
exports.MAIN_DIST = MAIN_DIST;
exports.RENDERER_DIST = RENDERER_DIST;
exports.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL;
