import React, { useEffect, useState } from 'react';
import { Card, Select, ColorPicker, Input, Button, Slider, InputNumber } from 'antd';
import { Palette, Type, Box, Keyboard } from 'lucide-react';
import styles from '@/assets/css/ScreenShotMain.module.css';
import { changeDpiDataUrl } from 'changedpi'

const Settings: React.FC = () => {
  const [fontFamilies, setFontFamilies] = useState<{ value: string, label: string }[]>([{ value: 'Arial', label: 'Arial' }])
  useEffect(() => {
    (async () => {
      let font = localStorage.getItem("fontList")
      if (!font) {
        try {
          const fontList: string[] = await window.ipcRenderer.invoke('get-font-list')
          setFontFamilies(fontList.map(str => { return { value: str, label: str } }))
          localStorage.setItem("fontList", JSON.stringify(fontFamilies))
        } catch (error) {
          setFontFamilies([
            { value: 'Arial', label: 'Arial' }
          ])
        }
      } else {
        setFontFamilies(JSON.parse(font))
      }
    })()
  }, [])



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
        window.ipcRenderer.send('create-pick-win', { imageUrl })
        // 停止视频流
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("捕获屏幕失败:", err);
    }
  }

  const [borderSeting, setBorderSeting] = useState({
    color: "#39C5BB",
    borderSize: 5
  })
  useEffect(() => {
    console.log(borderSeting);

  }, [borderSeting])

  const [pencilSeting, setPencilSetting] = useState({
    color: "#39C5BB",
    lineWidth: 2
  })
  const [fontSeting, setFontSetting] = useState({
    color: "#39C5BB",
    fontFamily: fontFamilies[0].value,
  })
  useEffect(() => {
    console.log(fontSeting);
  }, [fontSeting])
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <h1 className={styles.title}>裁剪工具</h1>
          <Button type="primary" onClick={pickHandle}>点击截屏</Button>
        </div>

        {/* Border Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <Box className={styles.cardIcon} size={24} />
            <h2 className={styles.cardTitle}>选框设置</h2>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>颜色:</span>
            <ColorPicker value={borderSeting.color} onChangeComplete={(color) => { setBorderSeting({ ...borderSeting, color: color.toHexString() }) }} />
            <span>{borderSeting.color}</span>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>粗细:</span>
            <Slider
              min={2}
              max={10}
              style={{ width: "300px" }}
              defaultValue={5}
              value={borderSeting.borderSize}
              onChange={(value) => { setBorderSeting({ ...borderSeting, borderSize: value }) }}
              onChangeComplete={(value) => {
                console.log('finsh', value);
              }}
            />
            <InputNumber
              value={borderSeting.borderSize}
              min={2} max={10} defaultValue={5}
              onChange={(value) => { setBorderSeting({ ...borderSeting, borderSize: value ? value : 5 }) }}
            />;
          </div>
        </Card>

        {/* Brush Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <Palette className={styles.cardIcon} size={24} />
            <h2 className={styles.cardTitle}>画笔</h2>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>颜色:</span>
            <ColorPicker value={borderSeting.color} onChangeComplete={(color) => { setBorderSeting({ ...borderSeting, color: color.toHexString() }) }} />
            <span>{borderSeting.color}</span>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>粗细:</span>
            <Slider
              min={1}
              max={50}
              style={{ width: "300px" }}
              defaultValue={2}
              value={pencilSeting.lineWidth}
              onChange={(value) => { setPencilSetting({ ...pencilSeting, lineWidth: value }) }}
              onChangeComplete={(value) => {
                console.log('finsh', value);
              }}
            />
            <InputNumber value={pencilSeting.lineWidth} min={1} max={50} defaultValue={2} onChange={(value) => { setPencilSetting({ ...pencilSeting, lineWidth: value ? value : 2 }) }} />;
          </div>
        </Card>

        {/* Font Settings */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <Type className={styles.cardIcon} size={24} />
            <h2 className={styles.cardTitle}>文字设置</h2>
          </div>
          <div className={styles.settingsGroup}>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>颜色:</span>
              <ColorPicker value={fontSeting.color} onChangeComplete={(color) => { setFontSetting({ ...fontSeting, color: color.toHexString() }) }} />
              <span>{fontSeting.color}</span>
            </div>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>字体:</span>
              <Select
                options={fontFamilies}
                defaultValue={fontFamilies[0].value}
                onChange={(value) => { setFontSetting({ ...fontSeting, fontFamily: value }) }}
              />
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <Keyboard className={styles.cardIcon} size={24} />
            <h2 className={styles.cardTitle}>Keyboard Shortcuts</h2>
          </div>
          <div className={styles.settingsGroup}>
            <div className={styles.shortcutRow}>
              <span className={styles.settingLabel}>Undo:</span>
              <Input className={styles.shortcutInput} defaultValue="Ctrl + Z" />
              <Button size="small">Edit</Button>
            </div>
            <div className={styles.shortcutRow}>
              <span className={styles.settingLabel}>Redo:</span>
              <Input className={styles.shortcutInput} defaultValue="Ctrl + Y" />
              <Button size="small">Edit</Button>
            </div>
            <div className={styles.shortcutRow}>
              <span className={styles.settingLabel}>Save:</span>
              <Input className={styles.shortcutInput} defaultValue="Ctrl + S" />
              <Button size="small">Edit</Button>
            </div>
            <div className={styles.shortcutRow}>
              <span className={styles.settingLabel}>Delete:</span>
              <Input className={styles.shortcutInput} defaultValue="Delete" />
              <Button size="small">Edit</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings