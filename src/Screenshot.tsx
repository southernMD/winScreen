/*
 * @Description: create by southernMD
 */

import { useCallback, useEffect, useRef, useState } from "react";
import './assets/css/Screenshot.css'
import { MouseCanvasStyle } from "./class/MouseCanvasStyle";
import { CropToolbar } from "./components/CropToolbar";
import { Square } from './class/Square'
import { Shape } from './class/Shape'
import { Circle } from "./class/Circle";
import { Pencil } from "./class/Pencil";

export default function Screenshot() {
    const [imgUrl, setImgUrl] = useState('')
    const [mouseCursor, setMouseCursor] = useState('default')
    const utilsRef = useRef<"" | "square" | "circle" | "pencil" | "font" | undefined>("");
    const mouseCursorRef = useRef('default');
    let fixedMouseCursor = 'default'
    useEffect(() => {
        mouseCursorRef.current = mouseCursor;
    }, [mouseCursor]);
    //canvasRef
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [clipStyle, setClipStyle] = useState<{ clip: string }>({ clip: 'rect(0px, 0px, 0px, 0px)' });
    const mouseCanvasCtxRef = useRef<MouseCanvasStyle | null>(null);

    const hideHandle = useCallback((e: KeyboardEvent) => {
        if (e.code === "Escape") closeWindowHandle();
    }, []);

    const mousedownHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        mouseCanvasCtxRef.current!.startX = e.clientX;
        mouseCanvasCtxRef.current!.startY = e.clientY;
        window.addEventListener("mousemove", mouseUpdateHandle);
        window.addEventListener("mouseup", mouseupHandle);
        window.removeEventListener("contextmenu", closeWindowHandle);
        window.addEventListener("contextmenu", resizeRectangle);
    }, []);

    const mouseUpdateHandle = useCallback((e: MouseEvent) => {
        mouseCanvasCtxRef.current!.endX = e.clientX;
        mouseCanvasCtxRef.current!.endY = e.clientY;
        mouseCanvasCtxRef.current!.drawRectangle();
    }, []);

    const mouseCursorStyleHandle = useCallback((e: MouseEvent) => {
        const type = mouseCanvasCtxRef.current!.mouseCursorStyleHandle(e);
        setMouseCursor(type);
        if(!(utilsRef.current !== '' && fixedMouseCursor === 'move')){
            if(Shape.shapeList.length != 0) Shape.canvas.style.cursor = 'default'
        }
    }, []);

    const screenShotSizeUpdateStartHandle = useCallback((e: MouseEvent) => {
        console.log(e.target);
        if (!(e.target instanceof HTMLCanvasElement)) return;
        if (e.button !== 0) return;
        Shape.selectingShape = null
        fixedMouseCursor = mouseCursorRef.current;
        mouseCanvasCtxRef.current!.screenShotSizeUpdateStartMousePostion.x = e.clientX;
        mouseCanvasCtxRef.current!.screenShotSizeUpdateStartMousePostion.y = e.clientY;
        window.addEventListener("mousemove", screenShotSizeUpdateHandle);
    }, [fixedMouseCursor]);

    const screenShotSizeUpdateHandle = useCallback((e: MouseEvent) => {
        console.log(utilsRef.current,fixedMouseCursor)
        if(utilsRef.current !== '' && fixedMouseCursor === 'move') return
        else {
            if(Shape.shapeList.length != 0)Shape.canvas.style.cursor = 'default'
        }
        mouseCanvasCtxRef.current!.screenShotSizeUpdateHandle(e, fixedMouseCursor);
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY)
        );
    }, [fixedMouseCursor, mouseCanvasCtxRef,utilsRef]);

    const screenShotSizeUpdateEndHandle = useCallback((e: MouseEvent) => {
        window.removeEventListener("mousemove", screenShotSizeUpdateHandle);
        if (!(e.target instanceof HTMLCanvasElement)) return;
        if (utilsRef.current !== '' && fixedMouseCursor === 'move') return
        if (!["default", "move"].includes(fixedMouseCursor))
            mouseCanvasCtxRef.current!.screenShotSizeEndUpdateHandle(e, fixedMouseCursor);
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY)
        );
    }, [fixedMouseCursor, mouseCanvasCtxRef,utilsRef.current]);

    const mouseupHandle = useCallback((e: MouseEvent) => {
        if (!(e.target instanceof HTMLCanvasElement)) return
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY),
        )
        window.removeEventListener('mousemove', mouseUpdateHandle)
        window.removeEventListener('mouseup', mouseupHandle)
        window.removeEventListener("mousedown", mousedownHandle)

        window.addEventListener('mousemove', mouseCursorStyleHandle)
        window.addEventListener('mousedown', screenShotSizeUpdateStartHandle)
        window.addEventListener('mouseup', screenShotSizeUpdateEndHandle)
    }, [mouseCanvasCtxRef])

    const resizeRectangle = () => {
        mouseCanvasCtxRef.current!.clearCanvas()
        setClipStyle({
            clip: `rect(0px, 0px, 0px, 0px)`
        });
        setMouseCursor('default')
        fixedMouseCursor = 'default'
        utilsRef.current = ''
        Shape.clearCanvasAndDom()

        window.removeEventListener('contextmenu', resizeRectangle)
        window.removeEventListener('mousemove', mouseUpdateHandle)
        window.removeEventListener('mousemove', mouseCursorStyleHandle)
        window.removeEventListener('mousedown', screenShotSizeUpdateStartHandle)
        window.removeEventListener('mouseup', screenShotSizeUpdateEndHandle)

        window.addEventListener('contextmenu', closeWindowHandle)
        window.addEventListener("mousedown", mousedownHandle)
    }
    const closeWindowHandle = () => {
        window.ipcRenderer.send('close-screen')
    }

    const setImgURl = ({ }, { imageUrl }: { imageUrl: string }) => {
        setImgUrl(imageUrl)
    }
    useEffect(() => {
        if (canvasRef.current && !mouseCanvasCtxRef.current) {
            mouseCanvasCtxRef.current = new MouseCanvasStyle(canvasRef.current);
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;

            mouseCanvasCtxRef.current.setOnClipChange((clip) => {
                setClipStyle({
                    clip: `rect(${clip.startY}px, ${clip.endX}px, ${clip.endY}px, ${clip.startX}px)`
                });
            });
            // mouseCanvasCtxRef.current.setOnCursorStyleChange((cursor)=>{
            //     fixedMouseCursor = cursor
            // })
        }
        window.addEventListener("contextmenu", closeWindowHandle);
        window.addEventListener("keydown", hideHandle)
        window.addEventListener("mousedown", mousedownHandle)
        window.ipcRenderer.on('get-screen-img', setImgURl)
        return () => {
            window.removeEventListener("contextmenu", closeWindowHandle)
            window.removeEventListener("keydown", hideHandle)
            window.removeEventListener("mousedown", mousedownHandle)
            window.removeEventListener('mousemove', mouseUpdateHandle)
            window.removeEventListener('mouseup', mouseupHandle)
            window.ipcRenderer.removeListener('get-screen-img', setImgURl)
        }
    }, [])

    const onDrawSquare = () => {
        if(utilsRef.current == 'square'){
            utilsRef.current = ''
        }else{
            utilsRef.current = 'square'
        }
    }
    const createSquareHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Square(e.clientX,e.clientY)
    },[])

    const onDrawCircle = () => {
        if(utilsRef.current == 'circle'){
            utilsRef.current = ''
        }else{
            utilsRef.current = 'circle'
        }
    }

    const createCircleHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Circle(e.clientX,e.clientY)
    },[])

    const onDraw = () => {
        if(utilsRef.current == 'pencil'){
            utilsRef.current = ''
        }else{
            utilsRef.current = 'pencil'
        }
    }

    const createPencilHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Pencil(e.clientX,e.clientY)
    },[])

    useEffect(()=>{
        window.removeEventListener('mousedown',createSquareHandle)
        window.removeEventListener('mousedown',createCircleHandle)
        window.removeEventListener('mousedown',createPencilHandle)
        if(utilsRef.current == ''){
            Shape.canvas.style.cursor = 'move'
        }else{
            Shape.canvas.style.cursor = 'default'
            setMouseCursor('default')
            if(utilsRef.current == 'square'){
                window.addEventListener('mousedown',createSquareHandle)
            }else if(utilsRef.current == 'circle'){
                window.addEventListener('mousedown',createCircleHandle)
            }else if(utilsRef.current == 'pencil'){
                window.addEventListener('mousedown',createPencilHandle)
            }
        }
    },[utilsRef.current])
    const savePick = () => {
        const img = new Image()
        img.src = imgUrl
        img.onload = () => {
            // 获取裁剪区域的坐标和尺寸
            const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
            const width = endX - startX;
            const height = endY - startY;
            // 创建一个新的 Canvas 用于绘制裁剪区域
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
                // 将原 Canvas 中的裁剪区域绘制到新的 Canvas 上
                tempCtx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
                tempCtx.drawImage(Shape.canvas, 0, 0, width, height)
                // 将新的 Canvas 转换为图片并下载
                const croppedImageDataURL = tempCanvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = croppedImageDataURL;
                link.download = 'cropped-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

    }



    return (
        <>
            <div className="screenshot">
                <CropToolbar
                    onDrawSquare={onDrawSquare}
                    onDrawCircle={onDrawCircle}
                    onDraw={onDraw}
                    onCheck={savePick}
                    onQuit={closeWindowHandle}
                    active={utilsRef.current}
                />
                <canvas className="select-box" ref={canvasRef}
                    style={{ cursor: mouseCursor }}
                ></canvas>
                <img className="bg" src={imgUrl} />
                <img className="choice" src={imgUrl} style={clipStyle} />
            </div>
        </>
    )
}