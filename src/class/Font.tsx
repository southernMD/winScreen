/*
 * @Description: create by southernMD
 */
import ReactDOM from "react-dom/client";
import { InputText } from "../components/InputText";
import { Shape } from "./Shape";
import { Point } from "./otherType";

interface Rect{
    topLeft:Point
    bottomRight:Point
}

export class Font extends Shape{
    topLeft:Point = {x:0,y:0}
    topRight:Point = {x:0,y:0}
    bottomLeft:Point = {x:0,y:0}
    bottomRight:Point = {x:0,y:0}
    fontSize:number = 12
    fontFamily:string = "Arial"
    fontColor:string = "#39C5BB"
    text:string = ""
    inputDom:HTMLElement | null = null
    constructor(clientX:number,clientY:number){
        super();
        const x = clientX - Shape.startX
        const y = clientY - Shape.startY
        this.topLeft = {x,y}
        this.inputDom = document.createElement("div")
        document.body.appendChild(this.inputDom)
        ReactDOM.createRoot(this.inputDom).render(
            <InputText 
            left={clientX} 
            top={clientY} 
            fontColor={this.fontColor}
            fontSize={this.fontSize} 
            onUpdateText={this.onUpdateText}
            inputBlur={this.inputBlur}
            />
        );
        const mutationObserver = new MutationObserver(() => {
            if(this.inputDom?.firstChild){
                mutationObserver.disconnect()
                const resizeObserver = new ResizeObserver((entries) => {
                    console.log(entries[0]);
                    const {width,height} = (this.inputDom?.firstChild as Element).getBoundingClientRect()
                    if(entries[0].contentRect.height == 0 || entries[0].contentRect.width == 0) return
                    this.topRight = {x:this.topLeft.x + width,y:this.topLeft.y}
                    this.bottomLeft = {x:this.topLeft.x,y:this.topLeft.y + height}
                    this.bottomRight = {x:this.topLeft.x + width,y:this.topLeft.y + height}
                    const clipRect = this.getVisibleRect({
                        topLeft:{
                            x:0,
                            y:0
                        },
                        bottomRight:{
                            x:Shape.endX - Shape.startX,
                            y:Shape.endY - Shape.startY
                        }
                    },
                    {
                        topLeft:this.topLeft,
                        bottomRight:this.bottomRight
                    })
                    if (!clipRect) {
                        (this.inputDom!.firstChild as HTMLElement).style.display = "none"; // 如果完全不可见，隐藏元素
                        return;
                    }
                    const { topLeft, bottomRight } = clipRect!;
                    const clipLeft = topLeft.x - this.topLeft.x;
                    const clipTop = topLeft.y - this.topLeft.y;
                    const clipRight = bottomRight.x - this.topLeft.x;
                    const clipBottom = bottomRight.y - this.topLeft.y;
                    (this.inputDom!.firstChild as HTMLElement).style.clipPath = `polygon(
                        ${clipLeft}px ${clipTop}px, 
                        ${clipRight}px ${clipTop}px, 
                        ${clipRight}px ${clipBottom}px, 
                        ${clipLeft}px ${clipBottom}px
                    )`
                })
                resizeObserver.observe(this.inputDom?.firstChild as Element)
            }

        });
        mutationObserver.observe(this.inputDom, { childList: true });
        // const resizeObserver = new ResizeObserver((entries) => {
        //     console.log(entries);
        // })
        // console.log(this.inputDom.firstChild);
        // resizeObserver.observe(this.inputDom.querySelector("div")!)
    }
    private onUpdateText = (txt:string)=>{
        console.log(txt);
        this.text = txt
    }
    private inputBlur = ()=>{
    //    if(this.inputDom){
    //     document.body.removeChild(this.inputDom)
    //     const ctx = Shape.canvas.getContext('2d')!;
    //     ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    //     ctx.fillStyle = this.fontColor;
    //     ctx.textAlign = 'start'; // 确保文本对齐方式一致

    //    }
    }
    /**
     * 计算小框在大框内的可见区域
     * @param bigRect 大框的坐标
     * @param smallRect 小框的坐标
     * @returns 小框在大框内的可见部分坐标，如果完全不可见则返回 null
     */
    private getVisibleRect(bigRect: Rect, smallRect: Rect): Rect | null {
        const visibleTopLeft: Point = {
            x: Math.max(smallRect.topLeft.x, bigRect.topLeft.x),
            y: Math.max(smallRect.topLeft.y, bigRect.topLeft.y)
        };
    
        const visibleBottomRight: Point = {
            x: Math.min(smallRect.bottomRight.x, bigRect.bottomRight.x),
            y: Math.min(smallRect.bottomRight.y, bigRect.bottomRight.y)
        };
    
        // 检查是否仍然是一个有效的矩形（小框完全在大框外则无效）
        if (visibleTopLeft.x >= visibleBottomRight.x || visibleTopLeft.y >= visibleBottomRight.y) {
            return null;
        }
    
        return {
            topLeft: visibleTopLeft,
            bottomRight: visibleBottomRight
        };
    }
}