/*
 * @Description: create by southernMD
 */
import { Normal } from "./normal";
import { XY } from "./otherType";
import { Shape } from "./shape";

export class Square extends Shape {
    private normal: Normal;

    constructor(clientX:number,clientY:number) {
        super();
        this.normal = new Normal();
        this.normal.startX = clientX - Shape.startX
        this.normal.startY = clientY - Shape.startY
        window.addEventListener("mousemove", this.drawSquare)
        window.addEventListener("mouseup", this.endDrawSquare)
    }
    drawSquare = (e: MouseEvent) => {
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
        this.normal.endX = Math.min(Math.max(e.clientX - Shape.startX, 0), Shape.canvasWidth);
        this.normal.endY = Math.min(Math.max(e.clientY - Shape.startY, 0), Shape.canvasHeight);
        Shape.shapeList.push({
            type:'square',
            object:this
        })
        const ctx = Shape.canvas.getContext('2d')!
        ctx.clearRect(0, 0, Shape.canvasWidth, Shape.canvasHeight);
        for(let i=0;i<Shape.shapeList.length;i++){
            Shape.shapeList[i].object.drawRectangle()
        }
        window.removeEventListener("mousemove", this.drawSquare)
        window.removeEventListener("mouseup", this.endDrawSquare)
    }

    private drawRectangle() {
        console.log(this);
        const rectStartX = Math.min(this.normal.startX, this.normal.endX);
        const rectStartY = Math.min(this.normal.startY, this.normal.endY);
        const rectEndX = Math.max(this.normal.startX, this.normal.endX);
        const rectEndY = Math.max(this.normal.startY, this.normal.endY);
        const width = rectEndX - rectStartX;
        const height = rectEndY - rectStartY;
        // 绘制矩形
        const ctx = Shape.canvas.getContext('2d')!
        ctx.strokeStyle = '#39C5BB';
        ctx.lineWidth = 2;
        ctx.strokeRect(rectStartX, rectStartY, width, height);
    }
}
