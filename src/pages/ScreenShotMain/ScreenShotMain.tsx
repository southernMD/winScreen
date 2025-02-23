// src/pages/ScreenshotMain.tsx
import React, { useRef, useState } from 'react';
import Settings from './Setting';
import { Button } from 'antd';
import styles from '@/assets/css/ScreenShotMain.module.css';
import ImageList from './imageList/ImageList'

const ScreenShotMain: React.FC = () => {
  const settingsRef = useRef<{
    pickHandle: () => void,
    defaultSetting: () => void
  }>(null);

  const imageListRef = useRef<HTMLDivElement>(null);

  const callPickHandle = () => {
    if (settingsRef.current) {
      settingsRef.current.pickHandle();
    }
  };

  const defaultSettingHandle = () => {
    if (settingsRef.current) {
      settingsRef.current.defaultSetting();
    }
  };

  const [settingsVisible,setSettingsVisible] = useState(1)

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <h1 className={styles.title}>裁剪工具</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span onClick={()=>setSettingsVisible(1)} className={[styles.spanButton,`${settingsVisible === 1?styles.spanButtonActive:""}`].join(' ')}>截图列表</span>
            <span onClick={()=>setSettingsVisible(2)} className={[styles.spanButton,`${settingsVisible === 2?styles.spanButtonActive:""}`].join(' ')}>设置</span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button type="primary" onClick={defaultSettingHandle}>恢复默认</Button>
            <Button color="cyan" variant="solid" onClick={callPickHandle}>点击截屏</Button>
          </div>
        </div>
        <Settings ref={settingsRef} style={{display:settingsVisible == 2?'block':'none'}} />
        <ImageList ref={imageListRef} style={{display:settingsVisible == 1?'block':'none'}} />
      </div>
    </div>
  )
};

export default ScreenShotMain;