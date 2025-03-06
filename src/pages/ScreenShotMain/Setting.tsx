// src/pages/ScreenshotMain.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Card, Select, ColorPicker, Input, Button, Slider, InputNumber } from 'antd';
import { Palette, Type, Box, Keyboard, Folder } from 'lucide-react';
import styles from '@/assets/css/ScreenShotMain.module.css';
import { changeDpiDataUrl } from 'changedpi';
import { specialCharactersMap } from '@/utils/specialCharactersMap';
import type { InputRef } from 'antd';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import KeyBoardInput from '@/components/KeyBoardInput';

interface SettingsProps {
  style: React.CSSProperties;
  ref: React.ForwardedRef<{ pickHandle: () => void }>;
}


const Settings = forwardRef<{}, SettingsProps>(({ style }, ref) => {
  const [fontFamilies, setFontFamilies] = useLocalStorage<{ value: string, label: string }[]>('fontList', [{ value: 'Arial', label: 'Arial' }]);

  useEffect(() => {
    (async () => {
      let font = localStorage.getItem("fontList");
      if (!font) {
        try {
          const fontList: string[] = await window.ipcRenderer.invoke('get-font-list');
          setFontFamilies(fontList.map(str => ({ value: str, label: str })));
        } catch (error) {
          setFontFamilies([{ value: 'Arial', label: 'Arial' }]);
        }
      }
    })();
  }, [setFontFamilies]);


  const [borderSeting, setBorderSeting] = useLocalStorage<{ color: string, borderSize: number }>('borderSetting', { color: "#39C5BB", borderSize: 2 });

  const [pencilSeting, setPencilSetting] = useLocalStorage<{ color: string, lineWidth: number }>('pencilSetting', { color: "#39C5BB", lineWidth: 2 });

  const [fontSeting, setFontSetting] = useLocalStorage<{ color: string, fontFamily: string }>('fontSetting', { color: "#39C5BB", fontFamily: fontFamilies[0].value });

  const [KeyboardSeting, setKeyboardSetting] = useLocalStorage<{ pick: string }>('keyboardSetting', { pick: "Ctrl + F1" });

  const [keyboardStatus, keyboardStatusSetting] = useState<"error" | "">("")

  useEffect(() => {
    window.ipcRenderer.on('shortcut-key-pressed', pickHandle);
    settingKeyBord()
    return () => {
      window.ipcRenderer.removeAllListeners('shortcut-key-pressed')
    }
  }, [])
  const settingKeyBord = () => {
    window.ipcRenderer.send('set-key', { key: KeyboardSeting.pick, name: 'shortcut' })
  }

  const setKeyboardSettingHandle = (str: string) => {
    setKeyboardSetting({ ...KeyboardSeting, pick: str })
  }
  const keyboardStatusChange = (str: "error" | "") => {
    keyboardStatusSetting(str)
  }

  const pickHandle = async () => {
    try {
      await window.ipcRenderer.sendSync('close-win');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 300
        }
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx!.drawImage(video, 0, 0);

        const imageUrl = canvas.toDataURL('image/png');
        const daurl300dpi = changeDpiDataUrl(imageUrl, 300);
        // console.log('Captured frame as image URL:', daurl300dpi);

        window.ipcRenderer.send('create-pick-win', { imageUrl: daurl300dpi, borderSeting, pencilSeting, fontSeting, KeyboardSeting });
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("捕获屏幕失败:", err);
    }
  };
  const defaultSetting = () => {
    setBorderSeting({ color: "#39C5BB", borderSize: 2 });
    setPencilSetting({ color: "#39C5BB", lineWidth: 2 });
    setFontSetting({ color: "#39C5BB", fontFamily: fontFamilies[0].value });
    setKeyboardSetting({ pick: "Ctrl + F1" });
  };

  useImperativeHandle(ref, () => ({
    pickHandle, defaultSetting
  }));

  return (
    <div style={style}>

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
            min={2} max={10} defaultValue={2}
            onChange={(value) => { setBorderSeting({ ...borderSeting, borderSize: value ? value : 2 }) }}
          />
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
          <ColorPicker value={pencilSeting.color} onChangeComplete={(color) => { setPencilSetting({ ...pencilSeting, color: color.toHexString() }) }} />
          <span>{pencilSeting.color}</span>
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
          <InputNumber value={pencilSeting.lineWidth} min={1} max={50} defaultValue={2} onChange={(value) => { setPencilSetting({ ...pencilSeting, lineWidth: value ? value : 2 }) }} />
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
              value={fontSeting.fontFamily}
              onChange={(value) => { setFontSetting({ ...fontSeting, fontFamily: value }) }}
            />
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <Keyboard className={styles.cardIcon} size={24} />
          <h2 className={styles.cardTitle}>快捷键</h2>
        </div>
        <div className={styles.settingsGroup}>
          <div className={styles.shortcutRow}>
            <span className={styles.settingLabel}>截图</span>
            <KeyBoardInput
              updata={setKeyboardSettingHandle}
              blur={settingKeyBord}
              electronEventRegisterStatus={true}
              onKeyboardStatusChange={keyboardStatusChange}
              initValue={KeyboardSeting.pick}
              eventName='shortcut'
            />
            <span style={{ color: "red", display: keyboardStatus == "error" ? "block" : "none" }}>该快捷键已被占用</span>
          </div>
        </div>
      </Card>
    </div>
  );
})

export default Settings;