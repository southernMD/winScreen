import { Square } from "./Square";

/*
 * @Description: create by southernMD
 */
interface ShapeListType{
    type:string
    object:Square | any
}

export class Shape {
    static canvas: HTMLCanvasElement;
    static canvasWidth: number;
    static canvasHeight: number;
    static startX: number;
    static startY: number;
    static endX: number;
    static endY: number;
    static shapeList: ShapeListType[] = [];
    static {
        if (!Shape.canvas) {
            Shape.canvas = document.createElement('canvas');
        }
    }

    // 设置canvas的宽高和位置
    static initCanvas( left: number, top: number,width: number, height: number) {
        console.log('initCanvas');
        Shape.canvas.width = width;
        Shape.canvas.height = height;
        Shape.canvas.style.position = 'absolute';
        Shape.canvas.style.left = `${left}px`;
        Shape.canvas.style.top = `${top}px`;
        Shape.canvas.style.cursor = `move`;
        Shape.canvasHeight = height
        Shape.canvasWidth = width
        Shape.startX = left
        Shape.startY = top
        Shape.endX = left + width
        Shape.endY = top + height
        // Shape.canvas.style.backgroundColor = 'red'
        if (!document.body.contains(Shape.canvas)) {
            document.body.appendChild(Shape.canvas);
        }else{
            document.body.removeChild(Shape.canvas)
            document.body.appendChild(Shape.canvas);
        }
    }

    static clearCanvas(){
        if (document.body.contains(Shape.canvas)) {
            const ctx =  Shape.canvas.getContext('2d')!
            document.body.removeChild(Shape.canvas)
            ctx.clearRect(0, 0, Shape.canvas!.width, Shape.canvas!.height);
            Shape.shapeList = []
        }
    }
    //判断该点是否在画布范围内
    static isInCanvas(x: number, y: number) {
        return x >= Shape.startX && x <= Shape.endX && y >= Shape.startY && y <= Shape.endY
    }

    id:number
    constructor(){
        this.id = new Date().getTime()
    }
}
