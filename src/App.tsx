/*
 * @Author: southernMD 2483723241@qq.com
 * @Date: 2025-01-25 17:14:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-02 15:21:05
 * @FilePath: \winPick\src\App.tsx
 * @Description: 入口文件
 */
import { useState } from 'react'
import { CropToolbar } from './components/CropToolbar';
import { changeDpiDataUrl } from 'changedpi'
function App() {
  const pickHandle = async () => {
    try {
      await window.ipcRenderer.sendSync('close-win')
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 300
        }
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // 等待视频的元数据加载完成后提取帧
      video.onloadedmetadata = () => {
        // 设置 canvas 的尺寸与视频相同
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 绘制当前帧到 canvas
        ctx!.drawImage(video, 0, 0);

        // 将 canvas 转换为图片（base64 格式，PNG）
        const imageUrl = canvas.toDataURL('image/png');
        const daurl300dpi = changeDpiDataUrl(imageUrl, 300);
        console.log('Captured frame as image URL:', daurl300dpi);

        // 将图片 URL 显示在页面上
        // const img = document.createElement('img');
        // img.src = imageUrl;
        // document.body.appendChild(img);  // 将图片添加到页面上
        window.ipcRenderer.send('create-pick-win',{imageUrl})
        // 停止视频流
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("捕获屏幕失败:", err);
    }
  }
  return (
    <>
      <button onClick={pickHandle}>点击截屏</button>
    </>
  )
}

export default App
