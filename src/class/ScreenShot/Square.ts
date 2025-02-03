/*
 * @Description: create by southernMD
 */
/*
 * @Description: create by southernMD
 */
/*
 * @Description: create by southernMD
 */

import { Normal } from "./Normal";
import { Point } from "./otherType";
import { Shape } from "./Shape";

export class Square extends Shape {
    private normal: Normal;

    constructor(clientX:number,clientY:number) {
        super();
        console.log(">>>>实例化");
        
        this.normal = new Normal();
        this.normal.startX = clientX - Shape.startX
        this.normal.startY = clientY - Shape.startY
        window.addEventListener("mousemove", this.drawSquare)
        window.addEventListener("mouseup", this.endDrawSquare)
    }
    drawSquare = (e: MouseEvent) => {
        if(Shape.selectingShape){
            window.removeEventListener("mousemove", this.drawSquare)
            window.removeEventListener("mouseup", this.endDrawSquare)
            return
        }
        this.normal.endX = Math.min(Math.max(e.clientX - Shape.startX, 0), Shape.canvasWidth);
        this.normal.endY = Math.min(Math.max(e.clientY - Shape.startY, 0), Shape.canvasHeight);
        const ctx = Shape.canvas.getContext('2d')!
        ctx.clearRect(0, 0, Shape.canvasWidth, Shape.canvasHeight);
        this.drawRectangle()
        for(let i=0;i<Shape.shapeList.length;i++){
            Shape.shapeList[i].object.drawRectangle()
        }
    }
    endDrawSquare = (e: MouseEvent) => {
        window.removeEventListener("mousemove", this.drawSquare)
        window.removeEventListener("mouseup", this.endDrawSquare)
        if(Math.abs(this.normal.startX - (e.clientX - Shape.startX)) < 2 && Math.abs(this.normal.startY - (e.clientY - Shape.startY)) < 2) return
        if(this.normal.startX == this.normal.endX && this.normal.startY == this.normal.endY) return
        this.normal.endX = Math.min(Math.max(e.clientX - Shape.startX, 0), Shape.canvasWidth);
        this.normal.endY = Math.min(Math.max(e.clientY - Shape.startY, 0), Shape.canvasHeight);
        Shape.shapeList.push({
            type:'square',
            object:this
        })
        Shape.reDrawAllShape()
    }

    public drawRectangle(tips: string[] = [], type = 0) {
        // console.log(this);
        const rectStartX = Math.min(this.normal.startX, this.normal.endX);
        const rectStartY = Math.min(this.normal.startY, this.normal.endY);
        const rectEndX = Math.max(this.normal.startX, this.normal.endX);
        const rectEndY = Math.max(this.normal.startY, this.normal.endY);
        const width = rectEndX - rectStartX;
        const height = rectEndY - rectStartY;
        if(width == 0 && height == 0) return
        const ctx = Shape.canvas.getContext('2d')!
        ctx.fillStyle = '#39C5BB';
        const points = {
            topLeft: { x: rectStartX - this.normal.squareSize / 2, y: rectStartY - this.normal.squareSize / 2 },
            topRight: { x: rectEndX - this.normal.squareSize / 2, y: rectStartY - this.normal.squareSize / 2 },
            bottomLeft: { x: rectStartX - this.normal.squareSize / 2, y: rectEndY - this.normal.squareSize / 2 },
            bottomRight: { x: rectEndX - this.normal.squareSize / 2, y: rectEndY - this.normal.squareSize / 2 },
            topMid: { x: rectStartX + width / 2 - this.normal.squareSize / 2, y: rectStartY - this.normal.squareSize / 2 },
            bottomMid: { x: rectStartX + width / 2 - this.normal.squareSize / 2, y: rectEndY - this.normal.squareSize / 2 },
            midLeft: { x: rectStartX - this.normal.squareSize / 2, y: rectStartY + height / 2 - this.normal.squareSize / 2 },
            midRight: { x: rectEndX - this.normal.squareSize / 2, y: rectStartY + height / 2 - this.normal.squareSize / 2 }
        }
        for (const [key, value] of Object.entries(points)) {
            if (!tips.includes(key)) {
                //type = 1 y固定
                if (type == 1) {
                    (this.normal as any)[key] = { x: value.x, y: (this as any)[key].y };
                } else if (type == 2) {
                    (this.normal as any)[key] = { x: (this as any)[key].x, y: value.y };
                } else {
                    (this.normal as any)[key] = value // 动态更新点坐标
                }
            }
            if(this === Shape.selectingShape?.object){
                const point = (this.normal as any)[key];
                ctx.fillRect(point.x, point.y, this.normal.squareSize, this.normal.squareSize);
            }
        }
        // 绘制矩形
        ctx.strokeStyle = '#39C5BB';
        ctx.lineWidth = 2;
        ctx.strokeRect(rectStartX, rectStartY, width, height);
    }
    public getNormal(){
        return this.normal
    }
}
