/*
 * @Description: create by southernMD
 */
import { Normal } from "./Normal";
import { Point } from "./otherType";
import { Square } from "./Square";
import { Circle } from "./Circle";
import { Pencil } from "./Pencil";
import { Font } from "./Font";

interface ShapeType {
    type: 'square' | 'circle' | 'pencil' | 'font'
    object: Square | Circle | Pencil | Font
}

let cursor = ''

let lastClickTime = 0;
let clickTimeout:NodeJS.Timeout 

export abstract class Shape {
    static canvas: HTMLCanvasElement;
    static canvasWidth: number;
    static canvasHeight: number;
    static startX: number;
    static startY: number;
    static endX: number;
    static endY: number;
    static shapeList: ShapeType[] = [];
    static isLeftMouseDown = false;
    private static mouseEvent: MouseEvent | null = null
    private static _selectingShape: null | ShapeType = null;

    abstract drawRectangle(tips?: string[], type?: number): void;

    private static selectingShapeUpdateStartMousePostion = {
        x: 0,
        y: 0
    }
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
        window.removeEventListener("mousedown", Shape.moveSelectingShapeStart)
        window.removeEventListener("mousemove", Shape.moveSelectingShapeNormalCursorStyle)
        window.removeEventListener("mousemove", Shape.moveSelectingShapeFontCursorStyle)
        // window.removeEventListener("dblclick",Shape.editText)
        if (newShape) {
            if (this.isLeftMouseDown) {
                console.log("左键已经按下");
                Shape.moveSelectingShapeStart(Shape.mouseEvent!)
            }
            window.addEventListener("mousedown", Shape.moveSelectingShapeStart)
            if (Shape.selectingShape?.type === 'square' || Shape.selectingShape?.type === 'circle') {
                window.addEventListener("mousemove", Shape.moveSelectingShapeNormalCursorStyle)
            }else if(Shape.selectingShape?.type === 'font'){
                window.addEventListener("mousemove", Shape.moveSelectingShapeFontCursorStyle)
                window.addEventListener("mousedown",Shape.editText)
            }
            console.log("新选中的形状:", newShape);
        } else {
            // window.removeEventListener("mousedown",Shape.moveSelectingShapeStart)
            // window.removeEventListener("mousemove",Shape.moveSelectingShapeNormalCursorStyle)
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
                    console.log("当前的元素数量为", target.length);

                }
                return result;
            }
        });
        window.addEventListener("mousedown", (e: MouseEvent) => {
            if (e.button === 0) {
                Shape.mouseEvent = e
                Shape.isLeftMouseDown = true
            } else {
                Shape.mouseEvent = null
                Shape.isLeftMouseDown = false
            }
        })
        window.addEventListener("mouseup", (e: MouseEvent) => {
            if (e.button === 0) {
                Shape.mouseEvent = null
                Shape.isLeftMouseDown = false
            }
        })
        //删除选中
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.code === 'Delete' || e.code === 'Backspace') {
                if (Shape.selectingShape) {
                    Shape.shapeList = Shape.shapeList.filter(item => item.object.id !== Shape.selectingShape!.object.id)
                    Shape.selectingShape = null
                    Shape.reDrawAllShape()
                }
            }
        })
    }
    //移动选中的元素
    static moveSelectingShapeStart(e: MouseEvent) {
        if (e.button !== 0) return
        if (!Shape.isInCanvas(e.clientX, e.clientY)) return
        console.log('移动选中的元素开始');
        if (Shape.selectingShape?.type === 'square' || Shape.selectingShape?.type === 'circle') {
            Shape.selectingShapeUpdateStartMousePostion = {
                x: e.offsetX,
                y: e.offsetY
            }
            cursor = Shape.canvas.style.cursor
            window.addEventListener("mousemove", Shape.moveSelectingShapeNormalMoving)
            window.addEventListener("mouseup", Shape.endSelectingShapeNormalMoving)
        } else if (Shape.selectingShape?.type === 'pencil') {
            Shape.canvas.style.cursor= 'move'
            Shape.selectingShapeUpdateStartMousePostion = {
                x: e.offsetX,
                y: e.offsetY
            }
            window.addEventListener("mousemove", Shape.moveSelectingShapeLineMoving)
            window.addEventListener("mouseup", Shape.endSelectingShapeLineMoving)
        } else if (Shape.selectingShape?.type === 'font') {
            Shape.selectingShapeUpdateStartMousePostion = {
                x: e.offsetX,
                y: e.offsetY
            }
            cursor = Shape.canvas.style.cursor
            window.addEventListener("mousemove", Shape.moveSelectingShapeFontMoving)
            window.addEventListener("mouseup", Shape.endSelectingShapeFontMoving)
        }

    }
    //normal鼠标移动中
    private static moveSelectingShapeNormalMoving(e: MouseEvent) {
        Shape.moveSelectingShapeNormalMovingHandle(e, cursor)
    }
    private static moveSelectingShapeNormalMovingHandle(e: MouseEvent, cursor: string) {
        const _this = (Shape.selectingShape?.object as Circle | Square).getNormal()!
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
                console.log(_this.bottomRight);
                _this.startX = x
                _this.startY = y
                _this.endX = _this.bottomRight.x + _this.squareSize / 2
                _this.endY = _this.bottomRight.y + _this.squareSize / 2
                for (const [key, value] of Object.entries(points)) {
                    if (!['bottomRight'].includes(key)) {
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
                    if (!['bottomLeft'].includes(key)) {
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
                    if (!['topRight'].includes(key)) {
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
                    if (!['topLeft'].includes(key)) {
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
                    if (!['bottomLeft', 'bottomMid', 'bottomRight'].includes(key)) {
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
                    if (!['topLeft', 'topMid', 'topRight'].includes(key)) {
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
                    if (!['topRight', 'bottomRight', 'midRight'].includes(key)) {
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
                    if (!['topLeft', 'bottomLeft', 'midLeft'].includes(key)) {
                        (_this as any)[key] = { x: value.x, y: (_this as any)[key].y };
                    }
                }
                break

            case 'default':
                // 计算鼠标的移动位移
                const deltaX = x - Shape.selectingShapeUpdateStartMousePostion.x;
                const deltaY = y - Shape.selectingShapeUpdateStartMousePostion.y;
                Shape.selectingShapeUpdateStartMousePostion = {
                    x, y
                }
                Shape.moveingNormalShape({ deltaX, deltaY })
                break;
        }

        // Shape.reDrawAllShape()
        const ctx = Shape.canvas.getContext('2d')!
        ctx.clearRect(0, 0, Shape.canvas!.width, Shape.canvas!.height);
        for (let i = 0; i < Shape.shapeList.length; i++) {
            const shape = Shape.shapeList[i].object
            const shapeType = Shape.shapeList[i].type
            if (shape !== Shape.selectingShape?.object) shape.drawRectangle()
            else {
                const normalShape = (shape as Circle | Square).getNormal()
                ctx.strokeStyle = '#39C5BB';
                ctx.lineWidth = 2;
                const rectStartX = Math.min(normalShape.startX, normalShape.endX);
                const rectStartY = Math.min(normalShape.startY, normalShape.endY);
                const rectEndX = Math.max(normalShape.startX, normalShape.endX);
                const rectEndY = Math.max(normalShape.startY, normalShape.endY);
                const width = rectEndX - rectStartX;
                const height = rectEndY - rectStartY;
                ctx.strokeRect(rectStartX, rectStartY, width, height);
                ctx.fillStyle = '#39C5BB';
                const { topLeft, topMid, topRight, midLeft, midRight, bottomLeft, bottomMid, bottomRight } = normalShape.getPostionPoints()
                ctx.fillRect(topLeft.x, topLeft.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(topMid.x, topMid.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(topRight.x, topRight.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(midLeft.x, midLeft.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(midRight.x, midRight.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(bottomLeft.x, bottomLeft.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(bottomMid.x, bottomMid.y, normalShape.squareSize, normalShape.squareSize);
                ctx.fillRect(bottomRight.x, bottomRight.y, normalShape.squareSize, normalShape.squareSize);
                if (shapeType === 'square') { }
                if (shapeType === 'circle') {
                    const centerX = (normalShape.topMid.x + normalShape.bottomMid.x + normalShape.squareSize) / 2;
                    const centerY = (normalShape.topMid.y + normalShape.bottomMid.y + normalShape.squareSize) / 2;
                    const radiusX = Math.abs(normalShape.topMid.x - normalShape.midLeft.x);
                    const radiusY = Math.abs(normalShape.topMid.y - normalShape.midRight.y);

                    ctx.strokeStyle = '#39C5BB';
                    ctx.lineWidth = 2
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }


            }

        }
    }
    private static moveingNormalShape({ deltaX, deltaY }: { deltaX: number, deltaY: number }) {
        const _this = (Shape.selectingShape?.object as Circle | Square).getNormal()!
        // 获取 canvas 的宽度和高度
        const canvasWidth = Shape.canvasWidth
        const canvasHeight = Shape.canvasHeight;

        // 矫正位移，使得矩形不会超出画布范围
        let correctedDeltaX = deltaX;
        let correctedDeltaY = deltaY;

        // 判断左上角与右下角是否超出边界
        const rectStartX = Math.min(_this.startX + deltaX, _this.endX + deltaX);
        const rectStartY = Math.min(_this.startY + deltaY, _this.endY + deltaY);
        const rectEndX = Math.max(_this.startX + deltaX, _this.endX + deltaX);
        const rectEndY = Math.max(_this.startY + deltaY, _this.endY + deltaY);

        // 矫正 deltaX
        if (rectStartX < 0) {
            correctedDeltaX = correctedDeltaX - rectStartX;
        }
        if (rectEndX > canvasWidth) {
            correctedDeltaX = correctedDeltaX - (rectEndX - canvasWidth);
        }

        // 矫正 deltaY
        if (rectStartY < 0) {
            correctedDeltaY = correctedDeltaY - rectStartY;
        }
        if (rectEndY > canvasHeight) {
            correctedDeltaY = correctedDeltaY - (rectEndY - canvasHeight);
        }

        // 更新矩形的起点和终点坐标
        _this.startX += correctedDeltaX;
        _this.startY += correctedDeltaY;
        _this.endX += correctedDeltaX;
        _this.endY += correctedDeltaY;

        // 更新四角和中间点的坐标
        const points = [
            _this.topLeft,
            _this.topRight,
            _this.bottomLeft,
            _this.bottomRight,
            _this.topMid,
            _this.bottomMid,
            _this.midLeft,
            _this.midRight,
        ];
        points.forEach((point) => {
            point.x += correctedDeltaX;
            point.y += correctedDeltaY;
        });
    }
    private static endSelectingShapeNormalMoving(e: MouseEvent) {
        Shape.reDrawAllShape()
        window.removeEventListener('mousemove', Shape.moveSelectingShapeNormalMoving)
        window.removeEventListener('mouseup', Shape.endSelectingShapeNormalMoving)
        const _this = (Shape.selectingShape?.object as Circle | Square).getNormal()!
        if (cursor == 'default') return
        if (cursor.split('-')[0].length == 1) {
            if (cursor == 'n-resize' && _this.startY > _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 's-resize')
            } else if (cursor == 's-resize' && _this.startY <= _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'n-resize')
            } else if (cursor == 'w-resize' && _this.startX > _this.endX) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'e-resize')
            } else if (cursor == 'e-resize' && _this.startX <= _this.endX) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'w-resize')
            }
        } else {
            if (_this.startX > _this.endX && _this.startY < _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'ne-resize')
            } else if (_this.startX < _this.endX && _this.startY > _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'sw-resize')
            } else if (_this.startX > _this.endX && _this.startY > _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'se-resize')
            } else if (_this.startX < _this.endX && _this.startY < _this.endY) {
                Shape.moveSelectingShapeNormalMovingHandle(e, 'nw-resize')
            }
        }
    }

    //线移动
    private static moveSelectingShapeLineMoving(e:MouseEvent){
        
        const deltaX = e.clientX - Shape.startX - Shape.selectingShapeUpdateStartMousePostion.x;
        const deltaY = e.clientY - Shape.startY - Shape.selectingShapeUpdateStartMousePostion.y;
        const shape = Shape.selectingShape?.object as Pencil
        for(let i = 0;i<shape.getPoints().length;i++){
            const point = shape.getPoints()[i]
            point.x += deltaX
            point.y += deltaY
        }
        Shape.selectingShapeUpdateStartMousePostion = {
            x: e.clientX - Shape.startX,
            y: e.clientY - Shape.startY
        }
        Shape.reDrawAllShape()
    }
    private static endSelectingShapeLineMoving(e:MouseEvent){
        Shape.reDrawAllShape()
        Shape.canvas.style.cursor = 'default'
        // Shape.selectingShape = null
        window.removeEventListener('mousemove', Shape.moveSelectingShapeLineMoving)
        window.removeEventListener('mouseup', Shape.endSelectingShapeLineMoving)

    }

    //font移动缩放
    private static moveSelectingShapeFontMoving(e: MouseEvent) {
        Shape.moveSelectingShapeFontlMovingHandle(e, cursor)
    }
    private static moveSelectingShapeFontlMovingHandle(e: MouseEvent, cursor: string) {
        const _this = Shape.selectingShape?.object as Font;
        if (!_this) return;
    
        let x = e.clientX - Shape.startX;
        let y = e.clientY - Shape.startY;
    
        console.log(cursor);
    
        const minSize = _this.minHeight; // 防止宽高变成负数
    
        let newWidth, newHeight;
    
        switch (cursor) {
            case 'nw-resize': {  //  左上角拖动
                newHeight = Math.max(_this.bottomRight.y - y, minSize);
                _this.fontSize = 12 +  newHeight - _this.minHeight
                newWidth = Shape.getFontSizeWidth(_this) + 5

                _this.topLeft = { x: _this.bottomRight.x - newWidth, y: _this.bottomRight.y - newHeight };
                _this.topRight = { x: _this.bottomRight.x, y: _this.bottomRight.y - newHeight };
                _this.bottomLeft = { x:_this.bottomRight.x - newWidth, y: _this.bottomRight.y };

                break;
            }
            case 'ne-resize': {  //  右上角拖动
                newHeight = Math.max(y - _this.bottomLeft.y, minSize);
                _this.fontSize = 12 +  newHeight - _this.minHeight
                newWidth = Shape.getFontSizeWidth(_this) + 5

                _this.topRight = { x:_this.bottomLeft.x + newWidth, y: _this.bottomLeft.y - newHeight };
                _this.topLeft = { x: _this.bottomLeft.x, y: _this.bottomLeft.y - newHeight };
                _this.bottomRight = { x:_this.bottomLeft.x + newWidth, y: _this.bottomLeft.y };
                break;
            }
            case 'sw-resize': {  //  左下角拖动
                newHeight = Math.max(_this.topRight.y - y, minSize);
                _this.fontSize = 12 +  newHeight - _this.minHeight
                newWidth = Shape.getFontSizeWidth(_this) + 5

                _this.bottomLeft = { x:_this.topRight.x - newWidth, y: _this.topRight.y + newHeight };
                _this.topLeft = { x:_this.topRight.x - newWidth, y: _this.topRight.y };
                _this.bottomRight = { x: _this.topRight.x, y: _this.topRight.y + newHeight };
                break;
            }
            case 'se-resize': {  //  右下角拖动
                newHeight = Math.max(y - _this.topLeft.y, minSize);
                _this.fontSize = 12 +  newHeight - _this.minHeight
                newWidth = Shape.getFontSizeWidth(_this) + 5

                _this.bottomRight = { x:_this.topLeft.x + newWidth, y: _this.topLeft.y + newHeight };
                _this.topRight = { x:_this.topLeft.x + newWidth, y: _this.topLeft.y };
                _this.bottomLeft = { x: _this.topLeft.x, y: _this.topLeft.y + newHeight };
                _this.fontSize = 12 +  newHeight - _this.minHeight
                _this.inputDom
                break;
            }
            default: {
                const deltaX = x - Shape.selectingShapeUpdateStartMousePostion.x;
                const deltaY = y - Shape.selectingShapeUpdateStartMousePostion.y;
                Shape.selectingShapeUpdateStartMousePostion = {
                    x, y
                }
                _this.topLeft = { x: _this.topLeft.x + deltaX, y: _this.topLeft.y + deltaY }
                _this.topRight = { x: _this.topRight.x + deltaX, y: _this.topRight.y + deltaY }
                _this.bottomLeft = { x: _this.bottomLeft.x + deltaX, y: _this.bottomLeft.y + deltaY }
                _this.bottomRight = { x: _this.bottomRight.x + deltaX, y: _this.bottomRight.y + deltaY }
                break;
            }
        }
    
        Shape.reDrawAllShape();
    }
    //编辑文本
    private static editText(e:MouseEvent){
        if(e.button !== 0) return
        const currentTime = new Date().getTime();
    
        // 如果两次点击的时间间隔小于300ms，则触发双击事件
        if (currentTime - lastClickTime <= 300) {
            Shape.shapeList = Shape.shapeList.filter(item => item !== Shape.selectingShape)
            Shape.reDrawAllShape()
            const _this = Shape.selectingShape?.object as Font;
            _this.inputDom = _this.createInputDom(_this.topLeft.x + Shape.startX, _this.topLeft.y + Shape.startY)
            clearTimeout(clickTimeout); // 清除单击事件的延时
        } else {
            // 设置一个延时器，假设单击事件是300ms后触发
            clickTimeout = setTimeout(() => {
                console.log('单击事件触发');
            }, 300);
        }
    
        lastClickTime = currentTime; // 记录当前时间
    }
    
    private static endSelectingShapeFontMoving(e: MouseEvent) {
        window.removeEventListener('mousemove', Shape.moveSelectingShapeFontMoving)
        window.removeEventListener('mouseup', Shape.endSelectingShapeFontMoving)
    }

    //当选中后需要更具条件修改鼠标样式
    private static moveSelectingShapeNormalCursorStyle(e: MouseEvent) {
        Shape.canvas.style.cursor = Shape.checkNormalPointCursorStyle({ x: e.offsetX, y: e.offsetY }, (Shape.selectingShape?.object as Circle | Square).getNormal()!)
    }

    private static checkNormalPointCursorStyle({ x, y }: Point, { topLeft, topMid, topRight, midLeft, midRight, bottomLeft, bottomMid, bottomRight, squareSize }: Normal) {
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

    //font的鼠标样式
    private static moveSelectingShapeFontCursorStyle(e: MouseEvent) {
        Shape.canvas.style.cursor = Shape.checkFontPointCursorStyle({ x: e.offsetX, y: e.offsetY }, (Shape.selectingShape?.object as Font))
    }
    private static checkFontPointCursorStyle({ x, y }: Point, { topLeft, topRight, bottomLeft, bottomRight, squareSize }: Font) {
          // 检查是否在 topLeft 点范围内
          if (x >= topLeft.x - squareSize / 2 && x <= topLeft.x + squareSize / 2 &&
            y >= topLeft.y - squareSize / 2 && y <= topLeft.y + squareSize / 2) {
            return 'nw-resize';
        }

        // 检查是否在 topRight 点范围内
        if (x >= topRight.x - squareSize / 2 && x <= topRight.x + squareSize / 2 &&
            y >= topRight.y - squareSize / 2 && y <= topRight.y + squareSize / 2) {
            return 'ne-resize';
        }

        // 检查是否在 bottomLeft 点范围内
        if (x >= bottomLeft.x - squareSize / 2 && x <= bottomLeft.x + squareSize / 2 &&
            y >= bottomLeft.y - squareSize / 2 && y <= bottomLeft.y + squareSize / 2) {
            return 'sw-resize';
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
        if (!Shape.isInCanvas(e.clientX, e.clientY)) {
            if (Shape.selectingShape) {
                Shape.selectingShape = null
            }
            return
        }
        for (let i = 0; i < Shape.shapeList.length; i++) {
            const shape = Shape.shapeList[i]
            if (shape.type === 'square') {
                const normal = (shape.object as Square).getNormal()
                if (Shape.checkIfSquareBorderSelect(normal, e.offsetX, e.offsetY)) {
                    Shape.selectingShape = shape
                    Shape.reDrawAllShape()
                    return
                }
            } else if (shape.type === 'circle') {
                const normal = (shape.object as Circle).getNormal()
                if (Shape.checkIfCircleBorderSelect(normal, e.offsetX, e.offsetY) || Shape.checkIfSquareBorderSelect(normal, e.offsetX, e.offsetY)) {
                    Shape.selectingShape = shape
                    Shape.reDrawAllShape()
                    return
                }
            } else if (shape.type === 'pencil') {
                if (Shape.checkIfLineSelect(shape.object as Pencil, e.offsetX, e.offsetY)) {
                    Shape.selectingShape = shape
                    Shape.reDrawAllShape()
                    return
                }
            } else if(shape.type === 'font'){
                if(Shape.checkIfFontSelect(shape.object as Font, e.offsetX, e.offsetY)){
                    console.log('字被选中');
                    
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
    private static checkIfSquareBorderSelect(normal: Normal, x: number, y: number): boolean {
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
    }
    //判断是否在圆边上
    private static checkIfCircleBorderSelect(normal: Normal, x: number, y: number): boolean {
        // 计算椭圆的中心点
        const centerX = (normal.startX + normal.endX) / 2;
        const centerY = (normal.startY + normal.endY) / 2;

        // 计算半长轴（a）和半短轴（b）
        const a = Math.abs(normal.endX - normal.startX) / 2;
        const b = Math.abs(normal.endY - normal.startY) / 2;

        // 如果椭圆退化成一个点或者线，则返回 false
        if (a === 0 || b === 0) return false;

        // 计算点击点是否落在椭圆方程的范围内
        const value = (Math.pow(x - centerX, 2) / Math.pow(a, 2)) + (Math.pow(y - centerY, 2) / Math.pow(b, 2));

        // 设定一个误差范围（比如 ±2 像素）
        const threshold = 0.5;

        // 判断是否在边缘
        return Math.abs(value - 1) < threshold;
    }
    //判断是否在画的线上
    private static checkIfLineSelect(line: Pencil, x: number, y: number): boolean {
        const points = line.getPoints();
        const lineWidth = line.lineWidth ; // 允许的误差范围（半径）

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // 计算点 (x, y) 到 线段 (p1, p2) 的最短距离
            const distance = Shape.pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);

            // 如果点到线段的距离小于笔触宽度的一半，认为点在线上
            if (distance <= lineWidth) {
                return true;
            }
        }
        return false;
    }
    private static pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = len_sq !== 0 ? dot / len_sq : -1; // 计算投影参数

        let closestX, closestY;

        if (param < 0) {
            // 投影点在 p1 之外，选择 p1
            closestX = x1;
            closestY = y1;
        } else if (param > 1) {
            // 投影点在 p2 之外，选择 p2
            closestX = x2;
            closestY = y2;
        } else {
            // 计算投影点
            closestX = x1 + param * C;
            closestY = y1 + param * D;
        }

        // 计算最近点与鼠标点击点的距离
        const dx = px - closestX;
        const dy = py - closestY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private static checkIfFontSelect(font: Font, x: number, y: number): boolean {
        const { topLeft, bottomRight,topRight,bottomLeft,squareSize } = font
        return x >= topLeft.x && x <= bottomRight.x && y >= topLeft.y && y <= bottomRight.y || 
        (x >= topLeft.x - squareSize / 2 && x <= topLeft.x + squareSize / 2 && y >= topLeft.y - squareSize / 2 && y <= topLeft.y + squareSize / 2) || 
        (x >= topRight.x - squareSize / 2 && x <= topRight.x + squareSize / 2 && y >= topRight.y - squareSize / 2 && y <= topRight.y + squareSize / 2) ||
        (x >= bottomLeft.x - squareSize / 2 && x <= bottomLeft.x + squareSize / 2 && y >= bottomLeft.y - squareSize / 2 && y <= bottomLeft.y + squareSize / 2) || 
        (x >= bottomRight.x - squareSize / 2 && x <= bottomRight.x + squareSize / 2 && y >= bottomRight.y - squareSize / 2 && y <= bottomRight.y + squareSize / 2)
    }

    private static getFontSizeWidth(font: Font) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        ctx.font = `${font.fontSize}px ${font.fontFamily}`;
        ctx.fillStyle = font.fontColor;
        const width = ctx.measureText(font.text).width
        canvas.remove()
        return width
    }

    //重绘
    public static reDrawAllShape() {
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
