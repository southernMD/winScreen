/*
 * @Author: southernMD 2483723241@qq.com
 * @Date: 2025-01-25 17:14:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-01-26 20:50:18
 * @FilePath: \winPick\electron\preload.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  sendSync(...args: Parameters<typeof ipcRenderer.sendSync>) {
    const [channel, ...omit] = args
    return ipcRenderer.sendSync(channel, ...omit)
  },
  removeListener(...args: Parameters<typeof ipcRenderer.removeListener>){
    const [channel, ...omit] = args
    return ipcRenderer.removeListener(channel, ...omit)
  }
  // You can expose other APTs you need here.
  // ...
})
