/*
 * @Description: create by southernMD
 */
/*
 * @Description: create by southernMD
 */

import React, { forwardRef, LegacyRef, useState } from 'react';
import {
    Check,
    X,
    Pencil,
    Square,
    Circle,
    Type,
    Paintbrush
} from 'lucide-react';
import styles from '../assets/css/CropToolbar.module.css';
import { CustomSlider } from './CustomSlider/CustomSlider';

interface CropToolbarProps {
    onCheck?: () => void;
    onQuit?: () => void;
    onDrawSquare?: () => void;
    onDrawCircle?: () => void;
    onDraw: () => void;
    onFont: () => void;
    onMosaic: () => void;
    active?:'square' | 'circle' | 'pencil' | 'font' | 'mosaic' | '';
}

export const CropToolbar= forwardRef<HTMLDivElement, CropToolbarProps>(({ onCheck,onQuit,onDrawSquare,onDrawCircle,onDraw,onFont,onMosaic,active }, ref: LegacyRef<HTMLDivElement> ) => {
    const [mosaicSize, setMosaicSize] = useState(10);

    // Calculate thumb size based on pencil size (scaled down for UI)
    const handlePencilClick = ()=>{
        onMosaic()
    }
    return (
        <div ref={ref} className={styles.toolbar}>
            <div className={styles.toolGroup}>
                <button className={`${styles.toolButton} ${active === 'square' ? styles.active : ''}`} onClick={onDrawSquare}>
                    <Square size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'circle' ? styles.active : ''}`} onClick={onDrawCircle}>
                    <Circle size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'pencil' ? styles.active : ''}`} onClick={onDraw}>
                    <Pencil size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'font' ? styles.active : ''}`} onClick={onFont}>
                    <Type size={20} />
                </button>
                <button className={`${styles.toolButton} ${active === 'mosaic' ? styles.active : ''}`} onClick={handlePencilClick}>
                    <Paintbrush size={20}  />
                </button>
                <button className={styles.toolButton} onClick={onQuit}>
                    <X size={20} color="#ff0033" />
                </button>
                <button className={styles.toolButton} onClick={onCheck}>
                    <Check size={20} color="#44ba81" />
                </button>
            </div>
            <div className={`${styles.sliderPopup} ${active === 'mosaic' ? styles.visible : ''}`}>
                <CustomSlider
                    value={mosaicSize}
                    onChange={setMosaicSize}
                    min={1}
                    max={50}
                    thumbSizeMultiplier={0.75}
                />
            </div>
        </div>
    );
})