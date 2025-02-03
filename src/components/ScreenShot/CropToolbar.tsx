/*
 * @Description: create by southernMD
 */
import React, { forwardRef, LegacyRef, useEffect, useState } from 'react';
import {
    Check,
    X,
    Pencil,
    Square,
    Circle,
    Type,
    Paintbrush
} from 'lucide-react';
import styles from '@/assets/css/CropToolbar.module.css';
import { CustomSlider } from './CustomSlider/CustomSlider';
import { MosaicCursor } from './MosaicCursor/MosaicCursor';
import { createPortal } from 'react-dom';
interface CropToolbarProps {
    onCheck?: () => void;
    onQuit?: () => void;
    onDrawSquare?: () => void;
    onDrawCircle?: () => void;
    onDraw: () => void;
    onFont: () => void;
    onMosaic: () => void;
    onMosaicSizeChange?:(value:number)=>void
    isMosaicVisible:boolean
    active?:'square' | 'circle' | 'pencil' | 'font' | 'mosaic' | '';
}

export const CropToolbar= forwardRef<HTMLDivElement, CropToolbarProps>(({ onCheck,onQuit,onDrawSquare,onDrawCircle,onDraw,onFont,onMosaic,onMosaicSizeChange,active,isMosaicVisible }, ref: LegacyRef<HTMLDivElement> ) => {
    const [mosaicSize, setMosaicSize] = useState(10);
    // Calculate thumb size based on pencil size (scaled down for UI)
    const handlePencilClick = ()=>{
        onMosaic()
    }

    const handleMosaicSizeChange = (size: number) => {
        setMosaicSize(size);
        if (onMosaicSizeChange) {
            onMosaicSizeChange(size); // 调用回调函数
        }
    };


    useEffect(()=>{
        console.log(mosaicSize,isMosaicVisible);
        const dom = document.createElement("div")
        if(active === 'mosaic'){
            createPortal(
                <MosaicCursor 
                    size={mosaicSize}
                    isVisible={isMosaicVisible}
                />,dom
            )
            document.body.appendChild(dom)
        }
        return ()=>{
            dom.remove()
        }
    },[active,mosaicSize,isMosaicVisible])
    return (
        <div ref={ref} className={styles.toolbar}>
            <div className={styles.toolGroup}>
                <button title="矩形" className={`${styles.toolButton} ${active === 'square' ? styles.active : ''}`} onClick={onDrawSquare}>
                    <Square size={20} />
                </button>
                <button title='椭圆' className={`${styles.toolButton} ${active === 'circle' ? styles.active : ''}`} onClick={onDrawCircle}>
                    <Circle size={20} />
                </button>
                <button title='画笔' className={`${styles.toolButton} ${active === 'pencil' ? styles.active : ''}`} onClick={onDraw}>
                    <Pencil size={20} />
                </button>
                <button title='文字' className={`${styles.toolButton} ${active === 'font' ? styles.active : ''}`} onClick={onFont}>
                    <Type size={20} />
                </button>
                <button title='马赛克' className={`${styles.toolButton} ${active === 'mosaic' ? styles.active : ''}`} onClick={handlePencilClick}>
                    <Paintbrush size={20}  />
                </button>
                <button title='取消' className={styles.toolButton} onClick={onQuit}>
                    <X size={20} color="#ff0033" />
                </button>
                <button title='确定' className={styles.toolButton} onClick={onCheck}>
                    <Check size={20} color="#44ba81" />
                </button>
            </div>
            <div className={`${styles.sliderPopup} ${active === 'mosaic' ? styles.visible : ''}`}>
                <CustomSlider
                    value={mosaicSize}
                    onChange={handleMosaicSizeChange}
                    min={1}
                    max={50}
                    thumbSizeMultiplier={0.75}
                />
            </div>
        </div>
    );
})