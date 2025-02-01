/*
 * @Description: create by southernMD
 */
import ReactDOM from "react-dom/client";
import { InputText } from "../components/InputText";
import { Shape } from "./Shape";
import { Point } from "./otherType";

interface Rect {
    topLeft: Point
    bottomRight: Point
}

export class Font extends Shape {
    topLeft: Point = { x: 0, y: 0 }
    topRight: Point = { x: 0, y: 0 }
    bottomLeft: Point = { x: 0, y: 0 }
    bottomRight: Point = { x: 0, y: 0 }
    squareSize:number = 5
    fontSize: number = 12
    fontFamily: string = "Arial"
    fontColor: string = "#39C5BB"
    text: string = ""
    inputDom: HTMLElement | null = null
    mutationObserver: MutationObserver | null = null
    resizeObserver: ResizeObserver | null = null
    minHeight:number = 0
    constructor(clientX: number, clientY: number) {
        super();
        setTimeout(()=>{
            if(Shape.selectingShape) return
            const x = clientX - Shape.startX
            const y = clientY - Shape.startY
            this.topLeft = { x, y }
            this.inputDom = this.createInputDom(clientX, clientY)

        },0)
    }
    private onUpdateText = (txt: string) => {
        this.text = txt
    }
    private inputBlur = () => {
        if (this.inputDom) {
            document.body.removeChild(this.inputDom)
            if (this.text.trim().length == 0) return
            this.drawRectangle()
            Shape.shapeList.push({
                type: 'font',
                object: this
            })
            this.inputDom = null
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
                this.mutationObserver = null; 
            }
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null; 
            }
        }
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

    public createInputDom(clientX: number, clientY: number) {
        const dom = document.createElement("div")
        document.body.appendChild(dom)
        ReactDOM.createRoot(dom).render(
            <InputText
                left={clientX}
                top={clientY}
                fontColor={this.fontColor}
                fontSize={this.fontSize}
                onUpdateText={this.onUpdateText}
                inputBlur={this.inputBlur}
                intTxt={this.text}
            />
        );
        this.mutationObserver = new MutationObserver(() => {
            if (dom.firstChild) {
                this.mutationObserver!.disconnect()
                this.resizeObserver = new ResizeObserver((entries) => {
                    if (entries[0].contentRect.height == 0 || entries[0].contentRect.width == 0) return
                    // console.log(entries[0]);
                    this.fontShowRectFix()
                })
                this.resizeObserver.observe(dom.firstChild as Element)
            }

        });
        this.mutationObserver.observe(dom, { childList: true });
        return dom
    }
    private fontShowRectFix = () => {
        const { width, height } = (this.inputDom?.firstChild as Element).getBoundingClientRect()
        if(this.minHeight == 0)this.minHeight = height
        this.topRight = { x: this.topLeft.x + width, y: this.topLeft.y }
        this.bottomLeft = { x: this.topLeft.x, y: this.topLeft.y + height }
        this.bottomRight = { x: this.topLeft.x + width, y: this.topLeft.y + height }
        const clipRect = this.getVisibleRect({
            topLeft: {
                x: 0,
                y: 0
            },
            bottomRight: {
                x: Shape.endX - Shape.startX,
                y: Shape.endY - Shape.startY
            }
        },
            {
                topLeft: this.topLeft,
                bottomRight: this.bottomRight
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
    }

    public drawRectangle = () => {
        const ctx = Shape.canvas.getContext('2d')!;
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.fontColor;
        ctx.fillText(this.text, this.topLeft.x + 5, this.topLeft.y + this.fontSize + 5);
        if(this === Shape.selectingShape?.object){
            ctx.fillRect(this.topLeft.x - this.squareSize / 2, this.topLeft.y - this.squareSize / 2, this.squareSize, this.squareSize);
            ctx.fillRect(this.topRight.x - this.squareSize / 2, this.topRight.y - this.squareSize / 2, this.squareSize, this.squareSize);
            ctx.fillRect(this.bottomLeft.x - this.squareSize / 2, this.bottomLeft.y - this.squareSize / 2, this.squareSize, this.squareSize);
            ctx.fillRect(this.bottomRight.x - this.squareSize / 2, this.bottomRight.y - this.squareSize / 2, this.squareSize, this.squareSize);
            ctx.strokeStyle = this.fontColor;
            ctx.lineWidth = 1;
            const width = Math.abs(this.topLeft.x - this.bottomRight.x)
            const height = Math.abs(this.topLeft.y - this.bottomRight.y)
            ctx.strokeRect(this.topLeft.x, this.topLeft.y,width, height);
        }
    }
}