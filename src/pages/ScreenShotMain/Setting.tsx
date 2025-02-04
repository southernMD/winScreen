// src/pages/ScreenshotMain.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Card, Select, ColorPicker, Input, Button, Slider, InputNumber } from 'antd';
import { Palette, Type, Box, Keyboard } from 'lucide-react';
import styles from '@/assets/css/ScreenShotMain.module.css';
import { changeDpiDataUrl } from 'changedpi';
import { specialCharactersMap } from '@/utils/specialCharactersMap';
import type { InputRef } from 'antd';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsProps {
  style: React.CSSProperties;
  ref: React.ForwardedRef<{ pickHandle: () => void }>;
}


const Settings = forwardRef<{}, SettingsProps>(({style}, ref) => {
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

  const shortcutInputRef = useRef<InputRef | null>(null);

  const [keyboardStatus, keyboardStatusSetting] = useState<"error" | "">("")
  const keyboardStatusSettingErrorHandle = () => {
    keyboardStatusSetting("error")
  }
  const keyboardStatusSettingSuccessHandle = () => {
    keyboardStatusSetting("")
  }
  useEffect(() => {
    const inputElement = shortcutInputRef.current?.input;
    if (inputElement) {
      inputElement.addEventListener('keydown', fn1);
      inputElement.addEventListener('keyup', fn2);
      inputElement.addEventListener("blur", settingKeyBord)
      window.ipcRenderer.on("set-shortcut-key-error", keyboardStatusSettingErrorHandle)
      window.ipcRenderer.on("set-shortcut-key-no-error", keyboardStatusSettingSuccessHandle)
      settingKeyBord()
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', fn1);
        inputElement.removeEventListener('keyup', fn2);
        inputElement.removeEventListener("blur", settingKeyBord)
        window.ipcRenderer.removeAllListeners('shortcut-key-pressed')
        window.ipcRenderer.removeAllListeners("set-shortcut-key-error")
        window.ipcRenderer.removeAllListeners("set-shortcut-key-no-error")
      }
    };
  }, [shortcutInputRef]);
  const settingKeyBord = () => {
    window.ipcRenderer.removeAllListeners('shortcut-key-pressed')
    window.ipcRenderer.send('set-shortcut-key', string == "" ? KeyboardSeting.pick : string)
    window.ipcRenderer.on('shortcut-key-pressed', pickHandle);
  }

  let string = '';
  let flag = false;

  const fn1 = (event: KeyboardEvent) => {
    event.preventDefault();
    flag = false;
    let s: string[] = [];
    if (['Enter', 'Process', 'Meta', 'Backspace', 'Delete', 'Insert', 'Pause', 'ScrollLock', 'Tab', 'CapsLock', 'Cancel'].includes(event.key)) return;
    if (event.ctrlKey) s.push('Ctrl');
    if (event.shiftKey) s.push('Shift');
    if (event.altKey) s.push('Alt');
    if (!(['Control', 'Shift', 'Alt'].includes(event.key)) && s.length !== 0) {
      s.push(event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code) ? specialCharactersMap.get(event.code) : event.key.slice(0, 1).toUpperCase() + event.key.slice(1).toLowerCase()));
      string = s.join(' + ');
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
    } else if (s.length === 0) {
      string = event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code) ? specialCharactersMap.get(event.code) : event.key.slice(0, 1).toUpperCase() + event.key.slice(1).toLowerCase());
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
    } else if (s.length !== 0) {
      string = s.join(' + ');
      string += ' + ';
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
    }
  };

  const fn2 = (event: KeyboardEvent) => {
    event.preventDefault();

    if (!['Control', 'Shift', 'Alt', 'Enter', 'Process', 'Meta', 'Backspace', 'Delete', 'Insert', 'Pause', 'ScrollLock', 'Tab', 'CapsLock', 'Cancel'].includes(event.key)) {
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
      shortcutInputRef.current?.blur();
      return;
    }
    if (!event.ctrlKey && !event.shiftKey && !event.altKey && !flag) {
      string = 'Ctrl + F1';
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
      shortcutInputRef.current?.blur();
    } else if (!flag) {
      let s: string[] = [];
      if (event.ctrlKey) s.push('Ctrl');
      if (event.shiftKey) s.push('Shift');
      if (event.altKey) s.push('Alt');
      string = s.join(' + ');
      if (!string.endsWith('+ ')) string += ' + ';
      setKeyboardSetting({ ...KeyboardSeting, pick: string });
      shortcutInputRef.current?.blur();
    }
  };

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
        console.log('Captured frame as image URL:', daurl300dpi);

        window.ipcRenderer.send('create-pick-win', { imageUrl, borderSeting, pencilSeting, fontSeting, KeyboardSeting });
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
            <Input
              status={keyboardStatus}
              ref={shortcutInputRef}
              className={styles.shortcutInput}
              value={KeyboardSeting.pick}
              onChange={(e) => setKeyboardSetting({ ...KeyboardSeting, pick: e.target.value })}
            />
            <span style={{ color: "red", display: keyboardStatus == "error" ? "block" : "none" }}>该快捷键已被占用</span>
          </div>
        </div>
      </Card>
    </div>
  );
})

export default Settings;