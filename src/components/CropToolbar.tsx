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
}

export const CropToolbar: React.FC<CropToolbarProps> = ({ onCheck,onQuit,onDrawSquare }) => {
    return (
        <div className={styles.toolbar}>
            <div className={styles.toolGroup}>
                <button className={styles.toolButton} onClick={onDrawSquare}>
                    <Square size={20} />
                </button>
                <button className={styles.toolButton}>
                    <Circle size={20}  />
                </button>
                <button className={styles.toolButton}>
                    <Pencil size={20} />
                </button>
                <button className={styles.toolButton} >
                    <Type size={20}/>
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