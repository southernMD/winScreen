/*
 * @Description: create by southernMD
 */
import { useEffect, useRef, useState } from "react";
import "@/assets/css/InputText.css";

interface InputTextProps {
    top: number;
    left: number;
    fontSize: number;
    fontColor: string;
    intTxt:string
    onUpdateText: (txt: string) => void;
    inputBlur: () => void;
}

export const InputText: React.FC<InputTextProps> = ({
    top,
    left,
    fontSize,
    fontColor,
    onUpdateText,
    inputBlur,
    intTxt
}) => {
    const [inputValue, setInputValue] = useState(intTxt);
    const [inputWidth, setInputWidth] = useState(0);
    const [clipPath, setClipPath] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 监听 intTxt 变化，更新 inputValue
    useEffect(() => {
        setInputValue(intTxt);
    }, [intTxt]); // 🔹 让 React 监听 intTxt 变化

    // 在组件挂载后，获取初始的输入框宽度
    useEffect(() => {
        if (inputRef.current) {
            setInputWidth(inputRef.current.scrollWidth); // 设置初始宽度
            setTimeout(() => {
                inputRef.current!.focus();
            }, 0);
        }
    }, []); // 只在挂载时执行

    // 处理输入更新，并调整宽度
    const inputValueUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setInputValue(value);
        onUpdateText(value);

        // 调整输入框宽度
        if (inputRef.current) {
            setInputWidth(inputRef.current.scrollWidth);
        }
    };

    return (
        <div
            key={intTxt} // 🔹 强制 React 重新渲染
            style={{
                position: "fixed",
                top,
                left,
                border: `1px solid ${fontColor}`,
                width: inputWidth,
                clipPath,
                zIndex:9
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
