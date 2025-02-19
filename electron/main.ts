/*
 * @Description: create by southernMD
 */
import { app, BrowserWindow, desktopCapturer, ipcMain, session, screen, globalShortcut, Tray, nativeImage, Menu, dialog, shell } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path, { basename, dirname } from 'node:path'
import fs from 'node:fs'
const require = createRequire(import.meta.url)
const robot = require('robotjs') as typeof import('robotjs')
console.log(process.env.VITE_APP_NAME);

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import fontList from 'font-list'
import { PickWinSetting } from './mainType'
import { calculateBase64Hash, dataURLtoArrayBuffer } from './utils'
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

const trayIcon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'icon', 'icon.png'))

let mainwin: BrowserWindow | null
function createWindow() {
  mainwin = new BrowserWindow({
    icon: trayIcon,
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  mainwin.webContents.toggleDevTools()
  // Test active push message to Renderer-process.
  // win.webContents.on('did-finish-load', () => {
  //   win?.webContents.send('main-process-message', (new Date).toLocaleString())
  // })
  ipcMain.on('close-win', (event) => {
    mainwin!.minimize()
    let timer = setInterval(() => {
      if (mainwin?.isMinimized()) {
        setTimeout(() => {
          clearInterval(timer)
          event.returnValue = ''
        }, 50)
      }
    }, 10)
  })
  //字体列表
  ipcMain.handle('get-font-list', () => {
    return new Promise<any>((resolve, reject) => {
      fontList.getFonts()
        .then(fonts => {
          resolve(fonts)
        })
        .catch(err => {
          console.log(err)
        })
    })
  })
  mainwin.webContents.on('destroyed', () => {
    app.quit()
  })
  let lastKey = ''
  //截屏快捷键
  ipcMain.on("set-shortcut-key", ({ }, key: string) => {
    try {
      const op = key.replaceAll(" ", "")
      if (lastKey != "") globalShortcut.unregister(lastKey)
      globalShortcut.register(op, () => {
        mainwin?.webContents.send("shortcut-key-pressed")
      })
      lastKey = op
      mainwin?.webContents.send("set-shortcut-key-no-error")
    } catch (error) {
      mainwin?.webContents.send("set-shortcut-key-error")
    }

  })
  if (VITE_DEV_SERVER_URL) {
    mainwin.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    mainwin.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return mainwin
}

function createPickWindow(pickWinSettingObject: PickWinSetting) {
  const downloadSession = session.fromPartition(`screenshot-${Date.now()}`);
  const win = new BrowserWindow({
    icon: trayIcon,
    transparent: true,
    frame: false, // 关闭窗口边框
    alwaysOnTop: true, // 确保窗口始终在最上面
    // skipTaskbar: true, // 不显示在任务栏
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      session: downloadSession,
    },
  });
  win.webContents.toggleDevTools()
  ipcMain.on("close-screen", () => {
    if (!win.isDestroyed()) {
      downloadSession.removeAllListeners();
      downloadSession.clearStorageData();
      downloadSession.clearCache();
      win.destroy()
    }
  })
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + '#/pick')
  } else {
    // win.loadFile('dist/index.html')
    win.loadURL(`file://${__dirname}/../dist/index.html#/pick`)
  }
  win.webContents.on('dom-ready', () => {
    win.webContents.send('get-screen-img', pickWinSettingObject)
  })

  // 绑定当前窗口的事件监听器
  const handleSave = ({}, { url }:{url:string}) => {
    if (win.isDestroyed()) return;
    win.webContents.downloadURL(url);

    downloadSession.once('will-download', (event, item,webContents) => {
      item.setSaveDialogOptions({
        title: '选择存储路径',
        defaultPath: path.join(app.getPath("documents"), "da_nui_ma_toolbox", "Screenshots", `${Date.now()}.png`),
      });
      item.once('done', async ({},state) => {
        console.log(item.getSavePath(),state === 'completed');
        if(state === 'completed'){
          const hash = await calculateBase64Hash(url)
          mainwin!.webContents.send('finished-save-image',{hash,url,path:item.getSavePath(),fileName:basename(item.getSavePath())})
          mainwin!.restore()
        }
        downloadSession.removeAllListeners();
        downloadSession.clearStorageData();
        downloadSession.clearCache();
        win.destroy(); // 销毁当前窗口
      });
    });
  };
  ipcMain.once("save-screenShot", handleSave);
  win.setFullScreen(true)
  win.setAlwaysOnTop(true, 'screen-saver')

  return win
}

ipcMain.on('create-pick-win', (e, object: PickWinSetting) => {
  const pickWin = createPickWindow(object)
  pickWin.focus()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainwin = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      robot.moveMouse(10000, 10000);
      // Grant access to the first screen found.
      callback({ video: sources[0], audio: 'loopback', })
    })
    // If true, use the system picker if available.
    // Note: this is currently experimental. If the system picker
    // is available, it will be used and the media request handler
    // will not be invoked.
  })
  //托盘事件
  let appIcon = new Tray(trayIcon)
  appIcon.on('double-click', () => {
    mainwin!.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出', type: 'normal', click: () => {
        app.quit()
      }
    },
    {
      label: '显示主页面', type: 'normal', click: () => {
        mainwin!.show();
      }
    }
  ])
  appIcon.setContextMenu(contextMenu)
  appIcon.setToolTip("大牛马工具箱")
  //托盘事件结束

  //文件夹
  const basePath = path.join(app.getPath("documents"), "da_nui_ma_toolbox");
  const shortcutPath = path.join(basePath, "Screenshots");

  // 创建 basePath 和 shortcut 文件夹（如果不存在）
  fs.mkdirSync(basePath, { recursive: true });
  fs.mkdirSync(shortcutPath, { recursive: true });

})

ipcMain.handle('delete-image',({},{ imagePath })=>{
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  return true
})
ipcMain.handle('delete-images',({},{ imagePaths })=>{
  imagePaths.forEach((path:string) => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  });
  return true
})
ipcMain.handle('copy-image',async ({},{ imagePath,data })=>{
  if (fs.existsSync(imagePath)) {
    const arrayBuffer = fs.readFileSync(imagePath).buffer
    return {exist:true,arrayBuffer}
  }else{
    const arrayBuffer = await dataURLtoArrayBuffer(data)
    return {exist:false,arrayBuffer}
  }
})

ipcMain.handle("resave-screenShot", async ({}, { base64 }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainwin!, {
    title: '选择存储路径',
    defaultPath: path.join(app.getPath("documents"), "da_nui_ma_toolbox", "Screenshots", `${Date.now()}.png`),
  });

  if (!canceled) {
    // 将 base64 内容写入文件
    const base64Data = base64.replace(/^data:image\/png;base64,/, ""); // 去掉前缀
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('写入文件失败:', err);
        return { success: false, error: err };
      }
    });
    return { canceled,success: true, filePath,fileName:basename(filePath) };
  } else {
    return { canceled };
  }
});

ipcMain.on("open-image-Folder",({},{ imagePath })=>{
  if(fs.existsSync(imagePath)){
    shell.showItemInFolder(imagePath)
  }else{
    shell.openPath(dirname(imagePath))
  }
})

ipcMain.handle("open-image-File",({},{ imagePath })=>{
  if(fs.existsSync(imagePath)){
    shell.openPath(imagePath)
    return { success: true}
  }else{
    return { success: false}
  }
})

ipcMain.handle("copy-images",async ({},{ imagePaths })=>{
  const { canceled, filePaths } = await dialog.showOpenDialog(mainwin!, {
    title: '选择存储路径',
    properties:['openDirectory','showHiddenFiles']
  });
  const filePath = filePaths[0]
  if(!canceled){
    try {
      // 确保目标文件夹存在
      fs.mkdirSync(filePath, { recursive: true });
  
      // 遍历 imagePaths 数组，复制每个文件
      for (const imagePath of imagePaths) {
        const fileName = path.basename(imagePath); // 获取文件名
        const destinationPath = path.join(filePath, fileName); // 目标路径
        fs.copyFileSync(imagePath, destinationPath); // 复制文件
      }
      shell.openPath(filePath)
      return { success: true };
    } catch (error) {
      console.error('复制文件失败:', error);
      return { success: false, error: error.message };
    }
  }
})

ipcMain.handle('move-images', async  ({},{ imagePaths })=>{
  const { canceled, filePaths } = await dialog.showOpenDialog(mainwin!, {
    title: '选择存储路径',
    properties:['openDirectory','showHiddenFiles']
  });
  const filePath = filePaths[0]
  console.log(filePath);
  
  if(!canceled){
    try {
      fs.mkdirSync(filePath, { recursive: true });
      const newPaths = []
      // 遍历 imagePaths 数组，移动每个文件
      for (const imagePath of imagePaths) {
        const fileName = path.basename(imagePath); // 获取文件名
        const destinationPath = path.join(filePath, fileName); // 目标路径
        newPaths.push(destinationPath)
        fs.renameSync(imagePath, destinationPath); // 移动文件
      }
      shell.openPath(filePath)
      return { success: true,newPaths};
    } catch (error) {
      console.error('复制文件失败:', error);
      return { success: false, error: error.message };
    }
  }
});