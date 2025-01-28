/*
 * @Description: create by southernMD
 */
import { Normal } from "./Normal";
import { Point } from "./otherType";
import { Square } from "./Square";

/*
 * @Description: create by southernMD
 */
interface ShapeType {
    type: string
    object: Square 
}

let cursor = ''

export class Shape {
    static canvas: HTMLCanvasElement;
    static canvasWidth: number;
    static canvasHeight: number;
    static startX: number;
    static startY: number;
    static endX: number;
    static endY: number;
    static shapeList: ShapeType[] = [];
    private static _selectingShape: null | ShapeType = null;
    // 使用 getter 和 setter 监视 selectingShape 的变化
    static get selectingShape(): null | ShapeType {
        return this._selectingShape;
    }

    static set selectingShape(newShape: null | ShapeType) {
        if (this._selectingShape !== newShape) {
            this._selectingShape = newShape;
            Shape.handleSelectingShapeChange(newShape); // 调用变化处理方法
        }
    }

    private static handleSelectingShapeChange(newShape: ShapeType | null) {
        // 在 selectingShape 变化时执行的操作
        if (newShape) {
            window.addEventListener("mousedown",Shape.moveSelectingShapeStart)
            if(Shape.selectingShape?.type === 'square'  || Shape.selectingShape?.type === 'circle'){
                // window.removeEventListener("mousemove",Shape.moveSelectingShapeNormalCursorStyle)
                window.addEventListener("mousemove",Shape.moveSelectingShapeNormalCursorStyle)
            }
            console.log("新选中的形状:", newShape);
        } else {
            window.removeEventListener("mousedown",Shape.moveSelectingShapeStart)
            window.removeEventListener("mousemove",Shape.moveSelectingShapeNormalCursorStyle)
            console.log("取消选中任何形状");
        }
        Shape.reDrawAllShape(); // 在变化时重绘所有形状
    }

    static {
        if (!Shape.canvas) {
            Shape.canvas = document.createElement('canvas');
        }
        //当shapeList变化时添加点击事件
        Shape.shapeList = new Proxy(Shape.shapeList, {
            set(target, property, value) {
                const result = Reflect.set(target, property, value);
                if (property === 'length') {
                    if (target.length === 0) {
                        window.removeEventListener('mousedown', Shape.mousedownHandler);
                    } else if (target.length === 1) {
                        window.addEventListener('mousedown', Shape.mousedownHandler);
                    }
                }
                return result;
            }
        });

    }
    //移动选中的元素
    static moveSelectingShapeStart(e:MouseEvent){
        if(e.button !== 0) return
        if(!Shape.isInCanvas(e.clientX,e.clientY)) return
        if(Shape.selectingShape?.type === 'square'  || Shape.selectingShape?.type === 'circle'){
            console.log(Shape.selectingShape?.object.getNormal()!);
            cursor = Shape.canvas.style.cursor
            window.addEventListener("mousemove",Shape.moveSelectingShapeNormalMoving)
        }

    }
    //normal鼠标移动中
    private static moveSelectingShapeNormalMoving(e:MouseEvent){
        Shape.moveSelectingShapeNormalMovingHandle(e,cursor)
        window.addEventListener("mouseup",Shape.endSelectingShapeNormalMoving)
    }
    private static moveSelectingShapeNormalMovingHandle(e:MouseEvent,cursor:string){
        const _this = Shape.selectingShape?.object.getNormal()!
        const x = e.clientX - Shape.startX
        const y = e.clientY - Shape.startY

        const rectStartX = Math.min(_this.startX, _this.endX);
        const rectStartY = Math.min(_this.startY, _this.endY);
        const rectEndX = Math.max(_this.startX, _this.endX);
        const rectEndY = Math.max(_this.startY, _this.endY);
        const width = rectEndX - rectStartX;
        const height = rectEndY - rectStartY;
        const points = {
            topLeft: { x: rectStartX - _this.squareSize / 2, y: rectStartY - _this.squareSize / 2 },
            topRight: { x: rectEndX - _this.squareSize / 2, y: rectStartY - _this.squareSize / 2 },
            bottomLeft: { x: rectStartX - _this.squareSize / 2, y: rectEndY - _this.squareSize / 2 },
            bottomRight: { x: rectEndX - _this.squareSize / 2, y: rectEndY - _this.squareSize / 2 },
            topMid: { x: rectStartX + width / 2 - _this.squareSize / 2, y: rectStartY - _this.squareSize / 2 },
            bottomMid: { x: rectStartX + width / 2 - _this.squareSize / 2, y: rectEndY - _this.squareSize / 2 },
            midLeft: { x: rectStartX - _this.squareSize / 2, y: rectStartY + height / 2 - _this.squareSize / 2 },
            midRight: { x: rectEndX - _this.squareSize / 2, y: rectStartY + height / 2 - _this.squareSize / 2 }
        }

        switch (cursor) {
            case 'nw-resize':
                _this.startX = x
                _this.startY = y
                _this.endX = _this.bottomRight.x + _this.squareSize / 2
                _this.endY = _this.bottomRight.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['bottomRight'].includes(key)){
                        (_this as any)[key] = value; 
                    }
                }
                break
            case 'ne-resize':
                _this.startX = x
                _this.startY = y
                _this.endX = _this.bottomLeft.x + _this.squareSize / 2
                _this.endY = _this.bottomLeft.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['bottomLeft'].includes(key)){
                        (_this as any)[key] = value; 
                    }
                }
                break
            case 'sw-resize':
                _this.startX = x
                _this.startY = y
                _this.endX = _this.topRight.x + _this.squareSize / 2
                _this.endY = _this.topRight.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['topRight'].includes(key)){
                        (_this as any)[key] = value; 
                    }
                }
                break
            case 'se-resize':
                _this.startX = x
                _this.startY = y
                _this.endX = _this.topLeft.x + _this.squareSize / 2
                _this.endY = _this.topLeft.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['topLeft'].includes(key)){
                        (_this as any)[key] = value; 
                    }
                }
                break
            case 'n-resize':
                _this.startX = _this.topLeft.x + _this.squareSize / 2
                _this.startY = y
                _this.endX = _this.bottomRight.x + _this.squareSize / 2
                _this.endY = _this.bottomRight.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['bottomLeft', 'bottomMid', 'bottomRight'].includes(key)){
                        (_this as any)[key] = { x: (_this as any)[key].x, y: value.y };
                    }
                }
                break
            case 's-resize':
                _this.startX = _this.bottomRight.x + _this.squareSize / 2
                _this.startY = y
                _this.endX = _this.topLeft.x + _this.squareSize / 2
                _this.endY = _this.topLeft.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['topLeft', 'topMid', 'topRight'].includes(key)){
                        (_this as any)[key] = { x: (_this as any)[key].x, y: value.y };
                    }
                }
                break
            case 'w-resize':
                _this.startX = x
                _this.startY = _this.topLeft.y + _this.squareSize / 2
                _this.endX = _this.bottomRight.x + _this.squareSize / 2
                _this.endY = _this.bottomRight.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['topRight', 'bottomRight', 'midRight'].includes(key)){
                        (_this as any)[key] = { x: value.x, y: (_this as any)[key].y };
                    }
                }
                break
            case 'e-resize':
                _this.startX = x
                _this.startY = _this.topRight.y + _this.squareSize / 2
                _this.endX = _this.bottomLeft.x + _this.squareSize / 2
                _this.endY = _this.bottomLeft.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if(!['topLeft', 'bottomLeft', 'midLeft'].includes(key)){
                        (_this as any)[key] = { x: value.x, y: (_this as any)[key].y };
                    }
                }
                break
            
            // case 'move':
            //     // 计算鼠标的移动位移
            //     const deltaX = x - this.screenShotSizeUpdateStartMousePostion.x;
            //     const deltaY = y - this.screenShotSizeUpdateStartMousePostion.y;
            //     this.screenShotSizeUpdateStartMousePostion = {
            //         x,y
            //     }
            //     this.screenMove({deltaX,deltaY})
            //     break;
        }

        Shape.reDrawAllShape()
    }

    private static endSelectingShapeNormalMoving(e:MouseEvent){
        Shape.reDrawAllShape()
        window.removeEventListener('mousemove',Shape.endSelectingShapeNormalMoving)
        // const _this = Shape.selectingShape?.object.getNormal()!
        // if (cursor.split('-')[0].length == 1) {
        //     if (cursor == 'n-resize' && _this.startY > _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 's-resize')
        //     } else if (cursor == 's-resize' && _this.startY <= _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'n-resize')
        //     } else if (cursor == 'w-resize' && _this.startX > _this.endX) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'e-resize')
        //     } else if (cursor == 'e-resize' && _this.startX <= _this.endX) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'w-resize')
        //     }
        // } else {
        //     if (_this.startX > _this.endX && _this.startY < _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'ne-resize')
        //     } else if (_this.startX < _this.endX && _this.startY > _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'sw-resize')
        //     } else if (_this.startX > _this.endX && _this.startY > _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'se-resize')
        //     } else if (_this.startX < _this.endX && _this.startY < _this.endY) {
        //         this.moveSelectingShapeNormalMovingHandle(e, 'nw-resize')
        //     }
        // }
    }
    //当选中后需要更具条件修改鼠标样式
    private static moveSelectingShapeNormalCursorStyle(e:MouseEvent){
        Shape.canvas.style.cursor = Shape.checkNormalPointCursorStyle({x:e.offsetX,y:e.offsetY},Shape.selectingShape?.object.getNormal()!)
    }

    private static checkNormalPointCursorStyle({x,y}:Point,{topLeft,topMid,topRight,midLeft,midRight,bottomLeft,bottomMid,bottomRight,squareSize}:Normal){
         // 检查是否在 topLeft 点范围内
         if (x >= topLeft.x - squareSize / 2 && x <= topLeft.x + squareSize / 2 &&
            y >= topLeft.y - squareSize / 2 && y <= topLeft.y + squareSize / 2) {
            return 'nw-resize';
        }

        // 检查是否在 topMid 点范围内
        if (x >= topMid.x - squareSize / 2 && x <= topMid.x + squareSize / 2 &&
            y >= topMid.y - squareSize / 2 && y <= topMid.y + squareSize / 2) {
            return 'n-resize';
        }

        // 检查是否在 topRight 点范围内
        if (x >= topRight.x - squareSize / 2 && x <= topRight.x + squareSize / 2 &&
            y >= topRight.y - squareSize / 2 && y <= topRight.y + squareSize / 2) {
            return 'ne-resize';
        }

        // 检查是否在 midLeft 点范围内
        if (x >= midLeft.x - squareSize / 2 && x <= midLeft.x + squareSize / 2 &&
            y >= midLeft.y - squareSize / 2 && y <= midLeft.y + squareSize / 2) {
            return 'w-resize';
        }

        // 检查是否在 midRight 点范围内
        if (x >= midRight.x - squareSize / 2 && x <= midRight.x + squareSize / 2 &&
            y >= midRight.y - squareSize / 2 && y <= midRight.y + squareSize / 2) {
            return 'e-resize';
        }

        // 检查是否在 bottomLeft 点范围内
        if (x >= bottomLeft.x - squareSize / 2 && x <= bottomLeft.x + squareSize / 2 &&
            y >= bottomLeft.y - squareSize / 2 && y <= bottomLeft.y + squareSize / 2) {
            return 'sw-resize';
        }

        // 检查是否在 bottomMid 点范围内
        if (x >= bottomMid.x - squareSize / 2 && x <= bottomMid.x + squareSize / 2 &&
            y >= bottomMid.y - squareSize / 2 && y <= bottomMid.y + squareSize / 2) {
            return 's-resize';
        }

        // 检查是否在 bottomRight 点范围内
        if (x >= bottomRight.x - squareSize / 2 && x <= bottomRight.x + squareSize / 2 &&
            y >= bottomRight.y - squareSize / 2 && y <= bottomRight.y + squareSize / 2) {
            return 'se-resize';
        }
        return 'default'
    }

    // 设置canvas的宽高和位置
    static initCanvas(left: number, top: number, width: number, height: number) {
        console.log('initCanvas', Shape.shapeList.length);
        Shape.canvas.width = width;
        Shape.canvas.height = height;
        Shape.canvas.style.position = 'absolute';
        Shape.canvas.style.left = `${left}px`;
        Shape.canvas.style.top = `${top}px`;
        Shape.canvasHeight = height
        Shape.canvasWidth = width
        Shape.startX = left
        Shape.startY = top
        Shape.endX = left + width
        Shape.endY = top + height
        Shape.reDrawAllShape()
        // Shape.canvas.style.backgroundColor = 'red'
        if (!document.body.contains(Shape.canvas)) {
            document.body.appendChild(Shape.canvas);
        } else {
            document.body.removeChild(Shape.canvas)
            document.body.appendChild(Shape.canvas);
        }
    }
    //清除canvas并消除所有数据
    static clearCanvasAndDom() {
        if (document.body.contains(Shape.canvas)) {
            const ctx = Shape.canvas.getContext('2d')!
            document.body.removeChild(Shape.canvas)
            ctx.clearRect(0, 0, Shape.canvas!.width, Shape.canvas!.height);
            Shape.shapeList = []
        }
    }
    //判断该点是否在画布范围内
    static isInCanvas(x: number, y: number) {
        return x >= Shape.startX && x <= Shape.endX && y >= Shape.startY && y <= Shape.endY
    }
    //选中元素事件
    private static mousedownHandler = (e: MouseEvent) => {
        if (e.button !== 0) return
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return
        for (let i = 0; i < Shape.shapeList.length; i++) {
            const shape = Shape.shapeList[i]
            if (shape.type === 'square' || shape.type === 'circle') {
                const normal = (shape.object as Square).getNormal()
                if (Shape.checkIfNormalBorderSelect(normal, e.offsetX, e.offsetY)) {
                    Shape.selectingShape = shape
                    Shape.reDrawAllShape()
                    return
                }
            }
        }
        Shape.selectingShape = null
        Shape.reDrawAllShape()
    }
    //判断是否选中边框
    private static checkIfNormalBorderSelect(normal: Normal, x: number, y: number): boolean {
        const { topLeft, topRight, bottomLeft, bottomRight, squareSize } = normal
        const clickPoint = { x, y }
        console.log(topLeft, topRight, bottomLeft, bottomRight, clickPoint);
        const isPointNearLine = (p1: Point, p2: Point, point: Point, width: number): boolean => {
            const a = p2.y - p1.y; // 直线方程 Ax + By + C = 0 中的 A
            const b = p1.x - p2.x; // 直线方程 Ax + By + C = 0 中的 B
            const c = p2.x * p1.y - p1.x * p2.y; // 直线方程 Ax + By + C = 0 中的 C

            // 点到直线距离公式: |Ax + By + C| / sqrt(A^2 + B^2)
            const distance = Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);

            // 检查点击点是否在边框宽度内
            if (distance <= width) {
                // 检查点是否在线段范围内 (投影到 x 和 y 的范围)
                const withinXRange = Math.min(p1.x, p2.x) - width <= point.x && point.x <= Math.max(p1.x, p2.x) + width;
                const withinYRange = Math.min(p1.y, p2.y) - width <= point.y && point.y <= Math.max(p1.y, p2.y) + width;
                return withinXRange && withinYRange;
            }
            return false;
        };

        // 检查点击点是否在矩形的四条边上
        return (
            isPointNearLine(topLeft, topRight, clickPoint, squareSize) ||
            isPointNearLine(bottomLeft, bottomRight, clickPoint, squareSize) ||
            isPointNearLine(topLeft, bottomLeft, clickPoint, squareSize) ||
            isPointNearLine(topRight, bottomRight, clickPoint, squareSize)
        );
        // if(normal.topLeft.x <= e.clientX && normal.topLeft.x + normal.squareSize >= e.clientX &&
        //     normal.topLeft.y <= e.clientY && normal.topLeft.y + normal.squareSize >= e.clientY){
        //         console.log('选中了');
        //         return true
        //     }else{
        //         Shape.ifSelectFnActive = false
        //         return false
        //     }
    }

    //重绘
    private static reDrawAllShape() {
        const ctx = Shape.canvas.getContext('2d')!
        ctx.clearRect(0, 0, Shape.canvas!.width, Shape.canvas!.height);
        for (let i = 0; i < Shape.shapeList.length; i++) {
            Shape.shapeList[i].object.drawRectangle()
        }
    }

    id: number
    constructor() {
        this.id = new Date().getTime()
    }
}
