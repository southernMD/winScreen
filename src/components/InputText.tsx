import { useEffect, useRef, useState } from "react";
import "../assets/css/InputText.css";
import { Shape } from "../class/Shape";

interface InputTextProps {
    top: number;
    left: number;
    fontSize: number;
    fontColor: string;
    onUpdateText: (txt: string) => void;
    inputBlur: () => void;
}

export const InputText: React.FC<InputTextProps> = ({
    top,
    left,
    fontSize,
    fontColor,
    onUpdateText,
    inputBlur
}) => {
    const [inputValue, setInputValue] = useState("");
    const [inputWidth, setInputWidth] = useState(0);
    const [clipPath,setClipPath] = useState("")
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 在组件挂载后，获取初始的输入框宽度
    useEffect(() => {
        if (inputRef.current) {
            setInputWidth(inputRef.current.scrollWidth);  // 设置初始宽度
            setTimeout(() => {
                inputRef.current!.focus();
                inputRef.current!.select();
            }, 0);
        }
    }, []);

    // 处理输入更新，并调整宽度
    const inputValueUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setInputValue(value);
        onUpdateText(value);

        // 调整输入框宽度
        if (inputRef.current) {
            setInputWidth(inputRef.current.scrollWidth); // 获取实际宽度
            // updateClipPath()
        }
    };

    const updateClipPath = () => {
        const canvasRect = Shape.canvas.getBoundingClientRect(); // 获取 canvas 的位置和尺寸
        const inputRect = inputRef.current!.getBoundingClientRect(); // 获取 input 容器的位置和尺寸

        // 检查 input 容器是否超出 canvas 的范围
        const canvasLeft = canvasRect.left;
        const canvasTop = canvasRect.top;
        const canvasRight = canvasRect.right;
        const canvasBottom = canvasRect.bottom;

        const inputLeft = inputRect.left;
        const inputTop = inputRect.top;
        const inputRight = inputRect.right;
        const inputBottom = inputRect.bottom;

        // 设置 clip-path 确保 input 容器不会超出 canvas 区域
        // 如果 input 超出 canvas 的区域，隐藏超出的部分
        const clippedLeft = Math.max(inputLeft, canvasLeft);
        const clippedTop = Math.max(inputTop, canvasTop);
        const clippedRight = Math.min(inputRight, canvasRight);
        const clippedBottom = Math.min(inputBottom, canvasBottom);

        if (clippedRight > clippedLeft && clippedBottom > clippedTop) {
            setClipPath(`inset(${clippedTop - inputTop}px ${inputRight - clippedRight}px ${inputBottom - clippedTop}px ${clippedLeft - inputLeft}px)`)
        } else {
            // 如果 input 完全超出了 canvas 区域，隐藏它
            setClipPath('inset(100%)');
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                top,
                left,
                border: `1px solid ${fontColor}`,
                width: inputWidth,
                padding: "0 5px",
                clipPath
            }}
        >
            <input
                ref={inputRef}
                value={inputValue}
                style={{
                    fontSize,
                    color: fontColor,
                }}
                onInput={inputValueUpdate}
                onBlur={inputBlur}
            />
        </div>
    );
};
