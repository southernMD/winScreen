import { Card, Input, Typography } from 'antd';
import React from 'react';
import styles from './ColorPick.module.css'
import { Keyboard } from 'lucide-react';
const { Title } = Typography;

const ColorPick: React.FC = () => {
    return (
        <div>
            <Title level={1} style={{ fontSize: '1.5rem' }}>取色器</Title>
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
};

export default ColorPick;
