/*
 * @Description: create by southernMD
 */
import React, { useEffect, useState } from 'react';
import styles from './MosaicCursor.module.css';
import { Shape } from '../../class/Shape';

interface MosaicCursorProps {
    size: number;
    isVisible: boolean;
}

export const MosaicCursor: React.FC<MosaicCursorProps> = ({ size, isVisible }) => {
    const [position, setPosition] = useState({ x: 10000, y: 10000 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        if (isVisible) {
            document.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={styles.pencilCursor}
            style={{
                left: position.x,
                top: position.y,
                width: size,
                height: size
            }}
        />
    );
}