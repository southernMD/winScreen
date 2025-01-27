/*
 * @Description: create by southernMD
 */
import { app, BrowserWindow, desktopCapturer, ipcMain, session,screen, globalShortcut } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
// import robot from 'robotjs'
const require = createRequire(import.meta.url)
const robot = require('robotjs') as typeof import('robotjs')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  win.webContents.toggleDevTools()
  // Test active push message to Renderer-process.
  // win.webContents.on('did-finish-load', () => {
  //   win?.webContents.send('main-process-message', (new Date).toLocaleString())
  // })
  ipcMain.on('close-win',(event)=>{
    win!.minimize()
    let timer = setInterval(()=>{
      if(win?.isMinimized()){
        setTimeout(()=>{
          clearInterval(timer)
          event.returnValue = ''
        },50)
      }
    },10)
  })
  win.webContents.on('destroyed',()=>{
    app.quit()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return win
}

function createPickWindow(imageUrl:Base64URLString){
  const win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    transparent: true,
    frame: false, // 关闭窗口边框
    alwaysOnTop: true, // 确保窗口始终在最上面
    // skipTaskbar: true, // 不显示在任务栏
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  win.webContents.toggleDevTools()
  ipcMain.on("close-screen",()=>{
    win.destroy()
  })
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL+'#/pick')
  } else {
    // win.loadFile('dist/index.html')
    win.loadURL(`file://${__dirname}/../dist/index.html#/pick`)
  }
  win.webContents.on('dom-ready',()=>{
    win.webContents.send('get-screen-img',{imageUrl})
  })
  win.setFullScreen(true)
  win.setAlwaysOnTop(true,'screen-saver')
  return win
}

ipcMain.on('create-pick-win',(e,{imageUrl})=>{
  const pickWin = createPickWindow(imageUrl)
  pickWin.focus()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(()=>{
  const win = createWindow()
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
})
