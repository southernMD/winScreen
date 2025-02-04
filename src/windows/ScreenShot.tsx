/*
 * @Description: create by southernMD
 */

import { useCallback, useEffect, useRef, useState } from "react";
import '@/assets/css/Screenshot.css'
import { MouseCanvasStyle } from "@/class/ScreenShot/MouseCanvasStyle";
import { CropToolbar } from "../components/ScreenShot/CropToolbar";
import { Square } from '@/class/ScreenShot/Square'
import { Shape } from '@/class/ScreenShot/Shape'
import { Circle } from "@/class/ScreenShot/Circle";
import { Pencil } from "@/class/ScreenShot/Pencil";
import { Font } from "@/class/ScreenShot/Font";
import { Mosaic } from "@/class/ScreenShot/Mosaic";
//@ts-ignore
import {changeDpiDataUrl} from 'changedpi'
import { createPortal } from "react-dom";
import { PickWinSetting } from "@/types/ScreenShotMain";
export default function Screenshot() {
    const [imgUrl, setImgUrl] = useState('')
    const [mouseCursor, setMouseCursor] = useState('default')
    const [utilsActive,setUtilsActive] = useState<"" | "square" | "circle" | "pencil" | "font" | "mosaic" | undefined>('')

    const utilsActiveRef = useRef(utilsActive);
    useEffect(() => {
        utilsActiveRef.current = utilsActive;
    }, [utilsActive]);

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
        mouseCanvasCtxRef.current!.isActive = false
        mouseCanvasCtxRef.current!.endX = e.clientX;
        mouseCanvasCtxRef.current!.endY = e.clientY;
        mouseCanvasCtxRef.current!.drawRectangle();
    }, []);

    const mouseCursorStyleHandle = useCallback((e: MouseEvent) => {
        const type = mouseCanvasCtxRef.current!.mouseCursorStyleHandle(e);
        setMouseCursor(type);
        if(!(utilsActiveRef.current !== '' && fixedMouseCursor === 'move')){
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
        console.log(utilsActiveRef.current,fixedMouseCursor)
        if(utilsActiveRef.current !== '' && fixedMouseCursor === 'move') return
        else {
            if(Shape.shapeList.length != 0)Shape.canvas.style.cursor = 'default'
        }
        mouseCanvasCtxRef.current!.screenShotSizeUpdateHandle(e, fixedMouseCursor);
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        mosaic?.resizeMosaic(mouseCanvasCtxRef.current!.clip)
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY)
        );
    }, [fixedMouseCursor, mouseCanvasCtxRef]);

    const screenShotSizeUpdateEndHandle = useCallback((e: MouseEvent) => {
        window.removeEventListener("mousemove", screenShotSizeUpdateHandle);
        if (!(e.target instanceof HTMLCanvasElement)) return;
        if (utilsActiveRef.current !== '' && fixedMouseCursor === 'move') return
        if (!["default", "move"].includes(fixedMouseCursor))
            mouseCanvasCtxRef.current!.screenShotSizeEndUpdateHandle(e, fixedMouseCursor);
        mouseCanvasCtxRef.current!.isActive = true
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        mosaic?.resizeMosaic(mouseCanvasCtxRef.current!.clip)
        mosaic?.updateImgData()
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY)
        );
    }, [fixedMouseCursor, mouseCanvasCtxRef]);

    const mouseupHandle = useCallback((e: MouseEvent) => {
        if (!(e.target instanceof HTMLCanvasElement)) return
        const { startX, startY, endX, endY } = mouseCanvasCtxRef.current!.clip;
        if(Math.abs(startX - endX) < 10 || Math.abs(startY - endY) < 10){
            resizeRectangle()
            return
        }
        mosaic?.resizeMosaic(mouseCanvasCtxRef.current!.clip)
        mosaic?.updateImgData()
        Shape.initCanvas(
            startX,
            startY,
            Math.abs(startX - endX),
            Math.abs(startY - endY),
        )
        mouseCanvasCtxRef.current!.isActive = true
        window.removeEventListener('mousemove', mouseUpdateHandle)
        window.removeEventListener('mouseup', mouseupHandle)
        window.removeEventListener("mousedown", mousedownHandle)

        window.addEventListener('mousemove', mouseCursorStyleHandle)
        window.addEventListener('mousedown', screenShotSizeUpdateStartHandle)
        window.addEventListener('mouseup', screenShotSizeUpdateEndHandle)
    }, [mouseCanvasCtxRef])

    const resizeRectangle = () => {
        mouseCanvasCtxRef.current!.clearCanvas()
        mouseCanvasCtxRef.current!.init()
        setClipStyle({
            clip: `rect(0px, 0px, 0px, 0px)`
        });
        setMouseCursor('default')
        fixedMouseCursor = 'default'
        setUtilsActive('')
        Shape.clearCanvasAndDom()
        Shape.initCanvas(0,0,0,0)

        mosaic?.destroy()
        

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


    useEffect(() => {
        if (canvasRef.current && !mouseCanvasCtxRef.current) {
            mouseCanvasCtxRef.current = new MouseCanvasStyle(canvasRef.current);
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            mouseCanvasCtxRef.current.setOnClipChange((clip) => {
                setClipStyle({
                    clip: `rect(${clip.startY}px, ${clip.endX}px, ${clip.endY}px, ${clip.startX}px)`
                });
                console.log("更新了");
            });
        }
        window.addEventListener("contextmenu", closeWindowHandle);
        window.addEventListener("keydown", hideHandle)
        window.addEventListener("mousedown", mousedownHandle)
        window.ipcRenderer.on('get-screen-img', setImgURlandBaseSet)
        return () => {
            window.removeEventListener("contextmenu", closeWindowHandle)
            window.removeEventListener("keydown", hideHandle)
            window.removeEventListener("mousedown", mousedownHandle)
            window.removeEventListener('mousemove', mouseUpdateHandle)
            window.removeEventListener('mouseup', mouseupHandle)
            window.ipcRenderer.removeListener('get-screen-img', setImgURlandBaseSet)
        }
    }, [])
    let pickSetting:PickWinSetting
    const setImgURlandBaseSet = ({},setting: PickWinSetting) => {
        setImgUrl(setting.imageUrl)
        mosaic?.setImgCanvas(setting.imageUrl, mouseCanvasCtxRef.current!.clip)
        pickSetting =  setting
    }

    const onDrawSquare = () => {
        if(utilsActive == 'square'){
            setUtilsActive("")
        }else{
            setUtilsActive("square")
        }
    }
    const createSquareHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Square(e.clientX,e.clientY,pickSetting.borderSeting.color,pickSetting.borderSeting.borderSize)
    },[])

    const onDrawCircle = () => {
        if(utilsActive == 'circle'){
            setUtilsActive("")
        }else{
            setUtilsActive("circle")
        }
    }

    const createCircleHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Circle(e.clientX,e.clientY,pickSetting.borderSeting.color,pickSetting.borderSeting.borderSize)
    },[])

    const onDraw = () => {
        if(utilsActive == 'pencil'){
            setUtilsActive("")
        }else{
            setUtilsActive("pencil")
        }
    }

    const createPencilHandle = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Pencil(e.clientX,e.clientY,pickSetting.pencilSeting.color,pickSetting.pencilSeting.lineWidth)
    },[])

    const onFont = () => {
        if(utilsActive == 'font'){
            setUtilsActive("")
        }else{
            setUtilsActive("font")
        }
    }

    const createFontHandle = useCallback((e:MouseEvent)=>{
        if (e.button !== 0) return;
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return;
        if (Shape.selectingShape) return;
        new Font(e.clientX,e.clientY,pickSetting.fontSeting.color,pickSetting.fontSeting.fontFamily)
    },[])


    const onMosaic = () => {
        if(utilsActive == 'mosaic'){
            setUtilsActive("")
        }else{
            setUtilsActive("mosaic")
        }
    }
    const [mosaicSize,setMosaicSize] = useState(10)
    const [mosaic,setMosaic] = useState<null | Mosaic>(new Mosaic(mosaicSize))
    const [isMosaicVisible,setIsMosaicVisible] = useState(false)
    const onMosaicSizeChange = (size:number)=>{
        setMosaicSize(size)
        mosaic!.resizeMosaicSize(size)
    }

    //TODO:马赛克会在操作大选取框时重置
    //TODO:马赛克应该使用最底下canvas实现而非新创建
    const mosaicMouseStyleHandle = (e:MouseEvent)=>{
        if(!Shape.isInCanvasNoBoeder(e.clientX,e.clientY) || fixedMouseCursor!="default"){
            setIsMosaicVisible(false)
            return
        }else{
            setIsMosaicVisible(true)
        }
    }
    

    useEffect(()=>{
        if(utilsActive == ''){
            Shape.canvas.style.cursor = 'move'
        }else{
            Shape.canvas.style.cursor = 'default'
            setMouseCursor('default')
            if(utilsActive == 'square'){
                window.addEventListener('mousedown',createSquareHandle)
            }else if(utilsActive == 'circle'){
                window.addEventListener('mousedown',createCircleHandle)
            }else if(utilsActive == 'pencil'){
                window.addEventListener('mousedown',createPencilHandle)
            }else if(utilsActive == 'font'){
                window.addEventListener('mousedown',createFontHandle)
            }else if(utilsActive == 'mosaic'){
                window.addEventListener("mousemove",mosaicMouseStyleHandle)
                Shape.isMosaic = true
            }
        }
        return ()=>{
            console.log("辅助");
            Shape.isMosaic = false
            window.removeEventListener('mousedown',createSquareHandle)
            window.removeEventListener('mousedown',createCircleHandle)
            window.removeEventListener('mousedown',createPencilHandle)
            window.removeEventListener('mousedown',createFontHandle)
            window.removeEventListener("mousemove",mosaicMouseStyleHandle)
        }
    },[utilsActive,setUtilsActive,mosaicSize])


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
            const dpr = window.devicePixelRatio;
            // 重新设置 canvas 自身宽高大小和 css 大小。放大 canvas；css 保持不变，因为我们需要那么多的点
            tempCanvas.width = Math.round(width * dpr);
            tempCanvas.height = Math.round(height * dpr);
            tempCanvas.style.width = width + 'px';
            tempCanvas.style.height = height + 'px';
            // 直接用 scale 放大整个坐标系，相对来说就是放大了每个绘制操作
            tempCtx!.scale(dpr, dpr);
            if (tempCtx) {
                // 将原 Canvas 中的裁剪区域绘制到新的 Canvas 上
                tempCtx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
                if(mosaic && mosaic.canvas)tempCtx.drawImage(mosaic.canvas, 0, 0, width, height)
                tempCtx.drawImage(Shape.canvas, 0, 0, width, height)
                // 将新的 Canvas 转换为图片并下载
                const croppedImageDataURL = tempCanvas.toDataURL('image/png', 1.0);
                const daurl300dpi = changeDpiDataUrl(croppedImageDataURL, 300);
                
                const link = document.createElement('a');
                link.href = daurl300dpi;
                link.download = 'cropped-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

    }


    const CropToolbarRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <div className="screenshot">
                {
                    createPortal(mouseCanvasCtxRef.current && mouseCanvasCtxRef.current.isActive ? (
                        <CropToolbar
                            ref={CropToolbarRef}
                            onDrawSquare={onDrawSquare}
                            onDrawCircle={onDrawCircle}
                            onDraw={onDraw}
                            onFont={onFont}
                            onMosaic={onMosaic}
                            onCheck={savePick}
                            onQuit={closeWindowHandle}
                            active={utilsActive}
                            onMosaicSizeChange={onMosaicSizeChange}
                            isMosaicVisible={isMosaicVisible}
                        />
                    ):'',document.body)
                }
                {
                    createPortal(
                        <canvas className="select-box" ref={canvasRef}
                            style={{ cursor: mouseCursor }}
                        ></canvas>,document.body
                    )
                }
                <img className="bg" src={imgUrl} />
                <img className="choice" src={imgUrl} style={clipStyle} />
            </div>
        </>
    )
}