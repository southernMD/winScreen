/*
 * @Description: create by southernMD
 */
/*
 * @Description: create by southernMD
 */
import React from 'react';
import {
    Check,
    X,
    Pencil,
    Square,
    Circle,
    Type
} from 'lucide-react';
import styles from '../assets/css/CropToolbar.module.css';

interface CropToolbarProps {
    onCheck?: () => void;
    onQuit?: () => void;
    onDrawSquare?: () => void;
    onDrawCircle?: () => void;
    active?:'square' | 'circle' | 'pencil' | 'type' | '';
}

export const CropToolbar: React.FC<CropToolbarProps> = ({ onCheck,onQuit,onDrawSquare,onDrawCircle,active }) => {
    return (
        <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
                <button className={`${styles.toolButton} ${active === 'square' ? styles.active : ''}`} onClick={onDrawSquare}>
                    <Square size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'circle' ? styles.active : ''}`} onClick={onDrawCircle}>
                    <Circle size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'pencil' ? styles.active : ''}`}>
                    <Pencil size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'type' ? styles.active : ''}`}>
                    <Type size={20} />
                </button>
                <button className={styles.toolButton} onClick={onQuit}>
                    <X size={20} color="#ff0033" />
                </button>
                <button className={styles.toolButton} onClick={onCheck}>
                    <Check size={20} color="#44ba81" />
                </button>
            </div>
        </div>
    );
};