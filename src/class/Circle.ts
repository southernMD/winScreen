import { Normal } from "./Normal";
import { Shape } from "./Shape";

export class Circle extends Shape {
    private normal: Normal;
    constructor(clientX: number, clientY: number) {
        super();
        this.normal = new Normal();
        this.normal.startX = clientX - Shape.startX
        this.normal.startY = clientY - Shape.startY
        window.addEventListener("mousemove", this.drawCircle)
        window.addEventListener("mouseup", this.endDrawCircle)
    }
    drawCircle = (e: MouseEvent) => {
        if (Shape.selectingShape) {
            window.removeEventListener("mousemove", this.drawCircle)
            window.removeEventListener("mouseup", this.endDrawCircle)
            return
        }
        this.normal.endX = Math.min(Math.max(e.clientX - Shape.startX, 0), Shape.canvasWidth);
        this.normal.endY = Math.min(Math.max(e.clientY - Shape.startY, 0), Shape.canvasHeight);
        const ctx = Shape.canvas.getContext('2d')!
        ctx.clearRect(0, 0, Shape.canvasWidth, Shape.canvasHeight);
        this.drawRectangle()
        for (let i = 0; i < Shape.shapeList.length; i++) {
            Shape.shapeList[i].object.drawRectangle()
        }
    }

    endDrawCircle = (e: MouseEvent) => {
        window.removeEventListener("mousemove", this.drawCircle)
        window.removeEventListener("mouseup", this.endDrawCircle)
        if(Math.abs(this.normal.startX - (e.clientX - Shape.startX)) < 2 && Math.abs(this.normal.startY - (e.clientY - Shape.startY)) < 2) return
        if(this.normal.startX == this.normal.endX && this.normal.startY == this.normal.endY) return
        this.normal.endX = Math.min(Math.max(e.clientX - Shape.startX, 0), Shape.canvasWidth);
        this.normal.endY = Math.min(Math.max(e.clientY - Shape.startY, 0), Shape.canvasHeight);
        Shape.shapeList.push({
            type:'circle',
            object: this
        })
        Shape.reDrawAllShape()
    }
    public drawRectangle(tips: string[] = [], type = 0) {
        const rectStartX = Math.min(this.normal.startX, this.normal.endX);
        const rectStartY = Math.min(this.normal.startY, this.normal.endY);
        const rectEndX = Math.max(this.normal.startX, this.normal.endX);
        const rectEndY = Math.max(this.normal.startY, this.normal.endY);
        const width = rectEndX - rectStartX;
        const height = rectEndY - rectStartY;
        if (width == 0 && height == 0) return
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
            if (this === Shape.selectingShape?.object) {
                // 绘制矩形边框
                ctx.strokeStyle = '#39C5BB';
                ctx.lineWidth = 2;
                ctx.strokeRect(rectStartX, rectStartY, width, height);
                const point = (this.normal as any)[key];
                ctx.fillRect(point.x, point.y, this.normal.squareSize, this.normal.squareSize);
            }
        }
        //更具topmid midLeft midright bottommid 画椭圆
        const centerX = (this.normal.topMid.x + this.normal.bottomMid.x + this.normal.squareSize) / 2;
        const centerY = (this.normal.topMid.y + this.normal.bottomMid.y + this.normal.squareSize) / 2;
        const radiusX = Math.abs(this.normal.topMid.x - this.normal.midLeft.x);
        const radiusY = Math.abs(this.normal.topMid.y - this.normal.midRight.y);

        ctx.strokeStyle = '#39C5BB';
        ctx.lineWidth = 2
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
    public getNormal() {
        return this.normal
    }
}