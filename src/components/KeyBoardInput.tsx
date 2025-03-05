import { specialCharactersMap } from "@/utils/specialCharactersMap";
import { Input, InputRef } from "antd";
import React, { useEffect, useRef, useState, useCallback, forwardRef } from "react";

interface KeyBoardInputProps {
    updata?: (str: string) => void;
    blur?: () => void;
    electronEventRegisterStatus: boolean;
    onKeyboardStatusChange?: (status: "error" | "") => void;
}

// 使用 forwardRef 来暴露 shortcutInputRef
const KeyBoardInput = forwardRef<InputRef | null, KeyBoardInputProps>(({ updata, blur, electronEventRegisterStatus = false, onKeyboardStatusChange }, ref) => {
    const [keyboardStatus, keyboardStatusSetting] = useState<"error" | "">("");
    const shortcutInputRef = useRef<InputRef | null>(null);
    const [stringInput, setStringInput] = useState<string>('');
    let string = '';
    let flag = false;
    useEffect(() => {
        console.log(stringInput);
    }, [stringInput])

    const fn1 = useCallback((event: KeyboardEvent) => {
        event.preventDefault();
        flag = false;
        let s: string[] = [];
        if (['Enter', 'Process', 'Meta', 'Backspace', 'Delete', 'Insert', 'Pause', 'ScrollLock', 'Tab', 'CapsLock', 'Cancel'].includes(event.key)) return;
        if (event.ctrlKey) s.push('Ctrl');
        if (event.shiftKey) s.push('Shift');
        if (event.altKey) s.push('Alt');
        if (!(['Control', 'Shift', 'Alt'].includes(event.key)) && s.length !== 0) {
            s.push(event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code) ? specialCharactersMap.get(event.code) : event.key.slice(0, 1).toUpperCase() + event.key.slice(1).toLowerCase()));
            string = s.join(' + ');
            if (updata) updata(string);
            setStringInput(string);
        } else if (s.length === 0) {
            string = event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code) ? specialCharactersMap.get(event.code) : event.key.slice(0, 1).toUpperCase() + event.key.slice(1).toLowerCase());
            if (updata) updata(string);
            setStringInput(string);
        } else if (s.length !== 0) {
            string = s.join(' + ');
            string += ' + ';
            if (updata) updata(string);
            setStringInput(string);
        }
    }, [updata]);

    const fn2 = useCallback((event: KeyboardEvent) => {
        debugger
        event.preventDefault();
        if (!['Control', 'Shift', 'Alt', 'Enter', 'Process', 'Meta', 'Backspace', 'Delete', 'Insert', 'Pause', 'ScrollLock', 'Tab', 'CapsLock', 'Cancel'].includes(event.key)) {
            if (updata) updata(string);
            setStringInput(string);
            shortcutInputRef.current?.blur();
            return;
        }
        if (!event.ctrlKey && !event.shiftKey && !event.altKey && !flag) {
            string = 'Ctrl + F1';
            if (updata) updata(string);
            setStringInput(string);
            shortcutInputRef.current?.blur();
        } else if (!flag) {
            let s: string[] = [];
            if (event.ctrlKey) s.push('Ctrl');
            if (event.shiftKey) s.push('Shift');
            if (event.altKey) s.push('Alt');
            string = s.join(' + ');
            if (!string.endsWith('+ ')) string += ' + ';
            if (updata) updata(string);
            setStringInput(string);
            shortcutInputRef.current?.blur();
        }
    }, [updata]);

    const keyboardStatusSettingErrorHandle = () => {
        keyboardStatusSetting("error");
    };

    const keyboardStatusSettingSuccessHandle = () => {
        keyboardStatusSetting("");
    };

    useEffect(() => {
        const inputElement = shortcutInputRef.current?.input;
        if (!inputElement) return;
        inputElement.addEventListener('keydown', fn1);
        inputElement.addEventListener('keyup', fn2);
        if (blur) inputElement.addEventListener('blur', blur);
        if (electronEventRegisterStatus) {
            window.ipcRenderer.on("set-shortcut-key-error", keyboardStatusSettingErrorHandle);
            window.ipcRenderer.on("set-shortcut-key-no-error", keyboardStatusSettingSuccessHandle);
        }
        return () => {
            inputElement.removeEventListener('keydown', fn1);
            inputElement.removeEventListener('keyup', fn2);
            if (blur) inputElement.removeEventListener('blur', blur);
            if (electronEventRegisterStatus) {
                window.ipcRenderer.removeAllListeners("set-shortcut-key-error");
                window.ipcRenderer.removeAllListeners("set-shortcut-key-no-error");
            }
        };
    }, [shortcutInputRef, blur, electronEventRegisterStatus, fn1, fn2]);

    // 将 shortcutInputRef 赋值给外部 ref
    React.useImperativeHandle(ref, () => shortcutInputRef.current!);

    // 监测 keyboardStatus 的变化并通知外部
    useEffect(() => {
        if (onKeyboardStatusChange) {
            onKeyboardStatusChange(keyboardStatus);
        }
    }, [keyboardStatus, onKeyboardStatusChange]);

    return (
        <Input
            status={keyboardStatus}
            ref={shortcutInputRef}
            style={{ width: "12rem" }}
            value={stringInput}
            onChange={(e) => updata ? updata(e.target.value) : void (0)}
        />
    );
});

export default KeyBoardInput;