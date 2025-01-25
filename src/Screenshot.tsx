import { useEffect } from "react";

/*
 * @Description: create by southernMD
 */
export default function Screenshot(){
    const hideHandle = (e:KeyboardEvent)=>{
        console.log(e);
        if(e.code === 'Escape'){
            window.ipcRenderer.send('close-screen')
        }
    }
    useEffect(()=>{
        window.addEventListener("keydown",hideHandle)
        return ()=>{
            window.removeEventListener("keydown",hideHandle)
        }
    },[])

    return (
        <>123</>
    )
}