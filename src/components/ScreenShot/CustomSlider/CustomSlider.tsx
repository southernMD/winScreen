/*
 * @Description: create by southernMD
 */
import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSlider.module.css';

interface CustomSliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    thumbSizeMultiplier?: number;
    className?: string;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
    value,
    onChange,
    min = 1,
    max = 50,
    thumbSizeMultiplier = 0.75,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const range = max - min;
    const percentage = ((value - min) / range) * 100;
    const thumbSize = Math.max(16, Math.min(32, value * thumbSizeMultiplier));

    const calculateValue = (clientX: number) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const position = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, position / rect.width));
        const newValue = Math.round(percentage * range + min);
        onChange(newValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        calculateValue(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        calculateValue(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className={`${styles.sliderContainer} ${className}`}>
            <div 
                ref={sliderRef}
                className={styles.customSlider}
                onMouseDown={handleMouseDown}
            >
                <div 
                    className={styles.sliderTrack}
                    style={{ width: `${percentage}%` }}
                />
                <div 
                    className={styles.sliderThumb}
                    style={{
                        left: `${percentage}%`,
                        width: `${thumbSize}px`,
                        height: `${thumbSize}px`
                    }}
                />
            </div>
            <span className={styles.sizeDisplay}>{value}</span>
        </div>
    );
};