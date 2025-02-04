/*
 * @Description: create by southernMD
 */
import { Point } from "./otherType";
import { Shape } from "./Shape";

export class Pencil extends Shape {
    ctx: CanvasRenderingContext2D;
    lineWidth:number
    strokeStyle:string
    private points: Point[] = [];

    constructor(clientX: number, clientY: number,color:string,lineWidth:number) {
        super();
        this.lineWidth = lineWidth;
        this.strokeStyle = color
        this.ctx = Shape.canvas.getContext("2d")!;
        this.ctx.strokeStyle = this.strokeStyle
        this.ctx.lineWidth = this.lineWidth;

        const startPoint = { x: clientX - Shape.startX, y: clientY - Shape.startY };
        this.points.push(startPoint);
        
        window.addEventListener("mousemove", this.draw);
        window.addEventListener("mouseup", this.drawEnd);
    }

    draw = (e: MouseEvent) => {
        if (Shape.selectingShape) {
            window.removeEventListener("mousemove", this.draw);
            window.removeEventListener("mouseup", this.drawEnd);
            return;
        }

        const drawingPoint = { x: e.clientX - Shape.startX, y: e.clientY - Shape.startY };

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        this.ctx.lineTo(drawingPoint.x, drawingPoint.y);
        this.ctx.stroke();

        this.points.push(drawingPoint);
    };

    drawEnd = () => {
        Shape.shapeList.push({
            type: "pencil",
            object: this,
        });
        this.ctx.closePath();
        this.drawRectangle()
        window.removeEventListener("mousemove", this.draw);
        window.removeEventListener("mouseup", this.drawEnd);
    };

    public drawRectangle() {
        this.ctx.strokeStyle = this.strokeStyle
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath(); // 确保闭合路径
    }
    public getPoints(){
        return this.points;
    }
}
