/*
 * @Description: create by southernMD
 */
import { useEffect, useRef, useState } from "react";
import './assets/css/Screenshot.css'
import { MouseCanvasStyle } from "./class/MouseCanvasStyle";
export default function Screenshot(){
    const [imgUrl,setImgUrl] = useState('')
    const [mouseCursor,setMouseCursor] = useState('default')
    const mouseCursorRef = useRef('default');
    let fixedMouseCursor = 'default'
    useEffect(() => {
        mouseCursorRef.current = mouseCursor;
    }, [mouseCursor]);
    //canvasRef
    const canvasRef = useRef<HTMLCanvasElement>(null) 
    const [clipStyle, setClipStyle] = useState<{ clip: string }>({ clip: 'rect(0px, 0px, 0px, 0px)' }); 
    const mouseCanvasCtxRef = useRef<MouseCanvasStyle | null>(null);

    const hideHandle = (e:KeyboardEvent)=>{
        if(e.code === 'Escape'){
            closeWindowHandle()
        }
    }

    const mousedownHandle = (e:MouseEvent)=>{
        if (e.button !== 0) return;
        mouseCanvasCtxRef.current!.startX = e.clientX
        mouseCanvasCtxRef.current!.startY = e.clientY
        window.addEventListener('mousemove',mouseUpdateHandle)
        window.addEventListener('mouseup',mouseupHandle)
        window.removeEventListener('contextmenu',closeWindowHandle)
        window.addEventListener('contextmenu',resizeRectangle)
    }
    const mouseUpdateHandle = (e:MouseEvent)=>{
        mouseCanvasCtxRef.current!.endX = e.clientX
        mouseCanvasCtxRef.current!.endY = e.clientY
        mouseCanvasCtxRef.current!.drawRectangle();
    }
    const mouseCursorStyleHandle = (e:MouseEvent)=>{
       const type = mouseCanvasCtxRef.current!.mouseCursorStyleHandle(e)
       setMouseCursor(type)
    }
    const screenShotSizeUpdateStartHandle = () =>{
        fixedMouseCursor = mouseCursorRef.current
        window.addEventListener('mousemove',screenShotSizeUpdateHandle)
    }
    const screenShotSizeUpdateHandle = (e:MouseEvent)=>{
        mouseCanvasCtxRef.current!.screenShotSizeUpdateHandle(e,fixedMouseCursor)
    }
    const screenShotSizeUpdateEndHandle = (e:MouseEvent)=>{
        mouseCanvasCtxRef.current!.screenShotSizeEndUpdateHandle(e)
        window.removeEventListener('mousemove',screenShotSizeUpdateHandle)
    }
    const mouseupHandle = ()=>{
        window.removeEventListener('mousemove',mouseUpdateHandle)
        window.removeEventListener('mouseup',mouseupHandle)
        window.removeEventListener("mousedown",mousedownHandle)

        window.addEventListener('mousemove',mouseCursorStyleHandle)
        window.addEventListener('mousedown',screenShotSizeUpdateStartHandle)
        window.addEventListener('mouseup',screenShotSizeUpdateEndHandle)
    }
    const resizeRectangle = ()=>{
        mouseCanvasCtxRef.current!.clearCanvas()
        setClipStyle({
            clip: `rect(0px, 0px, 0px, 0px)`
        });
        window.removeEventListener('contextmenu',resizeRectangle)
        window.addEventListener('contextmenu',closeWindowHandle)
        window.addEventListener("mousedown",mousedownHandle)
    }
    const closeWindowHandle = ()=>{
        window.ipcRenderer.send('close-screen')
    }

    const setImgURl = ({},{imageUrl}:{imageUrl:string})=>{
        setImgUrl(imageUrl)
    }
    useEffect(()=>{
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
        window.addEventListener("contextmenu",closeWindowHandle);
        window.addEventListener("keydown",hideHandle)
        window.addEventListener("mousedown",mousedownHandle)
        window.ipcRenderer.on('get-screen-img',setImgURl)
        return ()=>{
            window.removeEventListener("contextmenu",closeWindowHandle)
            window.removeEventListener("keydown",hideHandle)
            window.removeEventListener("mousedown",mousedownHandle)
            window.removeEventListener('mousemove',mouseUpdateHandle)
            window.removeEventListener('mouseup',mouseupHandle)
            window.ipcRenderer.removeListener('get-screen-img',setImgURl)
        }
    },[])


    return (
        <>
            <div className="screenshot">
                <canvas className="select-box" ref={canvasRef} 
                style={{cursor:mouseCursor}}
                ></canvas>
                <img className="bg" src={imgUrl}/>
                <img className="choice" src={imgUrl} style={clipStyle}/>
            </div>
        </>
    )
}