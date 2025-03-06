import { Button, Card, Input, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './ColorPick.module.css'
import { Keyboard } from 'lucide-react';
import KeyBoardInput from '@/components/KeyBoardInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';
const { Title } = Typography;

const ColorPick: React.FC = () => {
    const [keyboardStatus, keyboardStatusSetting] = useState<"error" | "">("")
    const [KeyboardSeting, setKeyboardSetting] = useLocalStorage<{ pick: string }>('keyboardColorPick', { pick: "Ctrl + F2" });
    const EVENT_NAME = 'colorPick'
    const setKeyboardSettingHandle = (str: string) => {
        setKeyboardSetting({ ...KeyboardSeting, pick: str })
    }
    const keyboardStatusChange = (str: "error" | "") => {
        keyboardStatusSetting(str)
    }

    useEffect(() => {
        window.ipcRenderer.on(`${EVENT_NAME}-key-pressed`, openColorPick);
        settingKeyBord()
        return () => {
            window.ipcRenderer.removeAllListeners(`${EVENT_NAME}-key-pressed`)
        }
    }, [])
    const settingKeyBord = () => {
        window.ipcRenderer.send('set-key', { key: KeyboardSeting.pick, name: EVENT_NAME })
    }

    const openColorPick = () => {
        //@ts-ignore
        const eyeDropper = new EyeDropper();
        eyeDropper
            .open()
            .then((result: { sRGBHex: string; }) => {
                navigator.clipboard.writeText(result.sRGBHex);
                message.success("已复制到剪贴板")
            })
            .catch((e: any) => {
                console.log(e);
                message.error('TODO:复制必须在窗口激活（EyeDropper限制）情况下使用');
            });
    }
    return (
        <div>
            <Title level={1} style={{ fontSize: '1.5rem' }}>取色器</Title>
            <Card className={styles.card} >
                <div className={styles.cardHeader}>
                    <Keyboard className={styles.cardIcon} size={24} />
                    <h2 className={styles.cardTitle}>快捷键</h2>
                    <span>（由于<a target='_blank' href='https://github.com/electron/electron/issues/27980'>#27980</a>，出框可以生效但是没有样式）</span>
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
                            eventName={EVENT_NAME}
                        />
                        <span style={{ color: "red", display: keyboardStatus == "error" ? "block" : "none" }}>该快捷键已被占用</span>
                    </div>
                    <div className={styles.shortcutRow}>
                        <Button onClick={openColorPick}>点击截图</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ColorPick;
