/*
 * @Description: create by southernMD
 */
export class MouseCanvasStyle {
    public canvas: HTMLCanvasElement | null = null
    public startX = 0
    public startY = 0
    public endX = 0
    public endY = 0
    public squareSize = 6
    public topLeft = { x: 0, y: 0 }
    public topMid = { x: 0, y: 0 }
    public topRight = { x: 0, y: 0 }
    public midLeft = { x: 0, y: 0 }
    public midRight = { x: 0, y: 0 }
    public bottomLeft = { x: 0, y: 0 }
    public bottomMid = { x: 0, y: 0 }
    public bottomRight = { x: 0, y: 0 }
    public clip = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    };
    public screenShotSizeUpdateStartMousePostion = {
        x:0,
        y:0
    }

    private onClipChange: ((clip: { startX: number, startY: number, endX: number, endY: number }) => void) | null = null;
    // private onCursorStyleChange: ((cursor: string) => void) | null = null;
    constructor(canvas: HTMLCanvasElement) {
        console.log(canvas);
        this.canvas = canvas
    }

    public setOnClipChange(callback: (clip: { startX: number, startY: number, endX: number, endY: number }) => void) {
        this.onClipChange = callback;
    }
    // public setOnCursorStyleChange(callback: (cursor: string) => void) {
    //     this.onCursorStyleChange = callback
    // }
    //type = 0 默认 type = 1 y固定 type = 2 x 固定
    public drawRectangle = (tips: string[] = [], type = 0) => {
        const ctx = this.canvas!.getContext('2d')!;
        // 清除之前的矩形
        ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

        // 计算矩形的宽度和高度
        const rectStartX = Math.min(this.startX, this.endX);
        const rectStartY = Math.min(this.startY, this.endY);
        const rectEndX = Math.max(this.startX, this.endX);
        const rectEndY = Math.max(this.startY, this.endY);
        const width = rectEndX - rectStartX;
        const height = rectEndY - rectStartY;

        // 绘制矩形
        ctx.strokeStyle = '#39C5BB';
        ctx.lineWidth = 2;
        ctx.strokeRect(rectStartX, rectStartY, width, height);

        // 绘制四角和每段中间的正方形
        ctx.fillStyle = '#39C5BB';
        const points = {
            topLeft: { x: rectStartX - this.squareSize / 2, y: rectStartY - this.squareSize / 2 },
            topRight: { x: rectEndX - this.squareSize / 2, y: rectStartY - this.squareSize / 2 },
            bottomLeft: { x: rectStartX - this.squareSize / 2, y: rectEndY - this.squareSize / 2 },
            bottomRight: { x: rectEndX - this.squareSize / 2, y: rectEndY - this.squareSize / 2 },
            topMid: { x: rectStartX + width / 2 - this.squareSize / 2, y: rectStartY - this.squareSize / 2 },
            bottomMid: { x: rectStartX + width / 2 - this.squareSize / 2, y: rectEndY - this.squareSize / 2 },
            midLeft: { x: rectStartX - this.squareSize / 2, y: rectStartY + height / 2 - this.squareSize / 2 },
            midRight: { x: rectEndX - this.squareSize / 2, y: rectStartY + height / 2 - this.squareSize / 2 }
        }

        // 更新点坐标，如果不在 tips 中则重新计算
        for (const [key, value] of Object.entries(points)) {
            if (!tips.includes(key)) {
                //type = 1 y固定
                if (type == 1) {
                    (this as any)[key] = { x: value.x, y: (this as any)[key].y };
                } else if (type == 2) {
                    (this as any)[key] = { x: (this as any)[key].x, y: value.y };
                } else {
                    (this as any)[key] = value; // 动态更新点坐标
                }
            }
            const point = (this as any)[key];
            ctx.fillRect(point.x, point.y, this.squareSize, this.squareSize);
        }
        // 更新裁剪区域
        this.clip.startX = rectStartX;
        this.clip.startY = rectStartY;
        this.clip.endX = rectEndX;
        this.clip.endY = rectEndY;

        // 触发裁剪区域变化的回调
        if (this.onClipChange) {
            this.onClipChange(this.clip);
        }
    };

    private draw = (ctx: CanvasRenderingContext2D) => {
        ctx.fillRect(this.topLeft.x, this.topLeft.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.topRight.x, this.topRight.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.bottomLeft.x, this.bottomLeft.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.bottomRight.x, this.bottomRight.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.midLeft.x, this.midLeft.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.midRight.x, this.midRight.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.topMid.x, this.topMid.y, this.squareSize, this.squareSize);
        ctx.fillRect(this.bottomMid.x, this.bottomMid.y, this.squareSize, this.squareSize);
    };

    public clearCanvas = () => {
        const ctx = this.canvas!.getContext('2d')!;
        ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    }

    public mouseCursorStyleHandle = (e: MouseEvent): string => {
        const x = e.clientX;
        const y = e.clientY;
        const blurSquareSize = this.squareSize + 6
        const rectStartX = Math.min(this.startX, this.endX);
        const rectStartY = Math.min(this.startY, this.endY);
        const rectEndX = Math.max(this.startX, this.endX);
        const rectEndY = Math.max(this.startY, this.endY);
        if (x > rectStartX && x < rectEndX && y > rectStartY && y < rectEndY) {
            return 'move';
        }
        // 检查是否在 topLeft 点范围内
        if (x >= this.topLeft.x - blurSquareSize / 2 && x <= this.topLeft.x + blurSquareSize / 2 &&
            y >= this.topLeft.y - blurSquareSize / 2 && y <= this.topLeft.y + blurSquareSize / 2) {
            return 'nw-resize';
        }

        // 检查是否在 topMid 点范围内
        if (x >= this.topMid.x - blurSquareSize / 2 && x <= this.topMid.x + blurSquareSize / 2 &&
            y >= this.topMid.y - blurSquareSize / 2 && y <= this.topMid.y + blurSquareSize / 2) {
            return 'n-resize';
        }

        // 检查是否在 topRight 点范围内
        if (x >= this.topRight.x - blurSquareSize / 2 && x <= this.topRight.x + blurSquareSize / 2 &&
            y >= this.topRight.y - blurSquareSize / 2 && y <= this.topRight.y + blurSquareSize / 2) {
            return 'ne-resize';
        }

        // 检查是否在 midLeft 点范围内
        if (x >= this.midLeft.x - blurSquareSize / 2 && x <= this.midLeft.x + blurSquareSize / 2 &&
            y >= this.midLeft.y - blurSquareSize / 2 && y <= this.midLeft.y + blurSquareSize / 2) {
            return 'w-resize';
        }

        // 检查是否在 midRight 点范围内
        if (x >= this.midRight.x - blurSquareSize / 2 && x <= this.midRight.x + blurSquareSize / 2 &&
            y >= this.midRight.y - blurSquareSize / 2 && y <= this.midRight.y + blurSquareSize / 2) {
            return 'e-resize';
        }

        // 检查是否在 bottomLeft 点范围内
        if (x >= this.bottomLeft.x - blurSquareSize / 2 && x <= this.bottomLeft.x + blurSquareSize / 2 &&
            y >= this.bottomLeft.y - blurSquareSize / 2 && y <= this.bottomLeft.y + blurSquareSize / 2) {
            return 'sw-resize';
        }

        // 检查是否在 bottomMid 点范围内
        if (x >= this.bottomMid.x - blurSquareSize / 2 && x <= this.bottomMid.x + blurSquareSize / 2 &&
            y >= this.bottomMid.y - blurSquareSize / 2 && y <= this.bottomMid.y + blurSquareSize / 2) {
            return 's-resize';
        }

        // 检查是否在 bottomRight 点范围内
        if (x >= this.bottomRight.x - blurSquareSize / 2 && x <= this.bottomRight.x + blurSquareSize / 2 &&
            y >= this.bottomRight.y - blurSquareSize / 2 && y <= this.bottomRight.y + blurSquareSize / 2) {
            return 'se-resize';
        }

        // 如果不在任何点范围内，返回默认样式
        return 'default';
    }

    public screenShotSizeUpdateHandle = (e: MouseEvent, mouseCursor: string) => {
        const x = e.clientX
        const y = e.clientY
        switch (mouseCursor) {
            case 'nw-resize':
                this.startX = x
                this.startY = y
                this.endX = this.bottomRight.x + this.squareSize / 2
                this.endY = this.bottomRight.y + this.squareSize / 2
                // if(this.startX >= this.endX && this.startY <= this.endY){
                //     setTimeout(()=>{
                //         this.onCursorStyleChange!('ne-resize')
                //     },100)
                // }else if(this.startX <= this.endX && this.startY >= this.endY){
                //     setTimeout(()=>{
                //         this.onCursorStyleChange!('sw-resize')
                //     },100)
                // }else if(this.startX >= this.endX && this.startY >= this.endY){
                //     setTimeout(()=>{
                //         this.onCursorStyleChange!('se-resize')
                //     },100)
                // }else{
                //     // this.drawRectangle(['bottomRight'])
                // }
                this.drawRectangle(['bottomRight'])
                break
            case 'ne-resize':
                this.startX = x
                this.startY = y
                this.endX = this.bottomLeft.x + this.squareSize / 2
                this.endY = this.bottomLeft.y + this.squareSize / 2
                // if(this.startX <= this.endX && this.startY <= this.endY){
                //     this.onCursorStyleChange!('nw-resize')

                // }else if(this.startX <= this.endX && this.startY >= this.endY){
                //     this.onCursorStyleChange!('sw-resize')

                // }else if(this.startX >= this.endX && this.startY >= this.endY){
                //     this.onCursorStyleChange!('se-resize')

                // }else{
                this.drawRectangle(['bottomLeft'])
                // }
                break
            case 'sw-resize':
                this.startX = x
                this.startY = y
                this.endX = this.topRight.x + this.squareSize / 2
                this.endY = this.topRight.y + this.squareSize / 2
                // if(this.startX <= this.endX && this.startY <= this.endY){
                //     this.onCursorStyleChange!('nw-resize')

                // }else if(this.startX >= this.endX && this.startY >= this.endY){
                //     this.onCursorStyleChange!('se-resize')

                // }else if(this.startX >= this.endX && this.startY <= this.endY){
                //     this.onCursorStyleChange!('ne-resize')

                // }else{
                this.drawRectangle(['topRight'])
                // }
                break
            case 'se-resize':
                this.startX = x
                this.startY = y
                this.endX = this.topLeft.x + this.squareSize / 2
                this.endY = this.topLeft.y + this.squareSize / 2
                // if(this.startX <= this.endX && this.startY <= this.endY){
                //     this.onCursorStyleChange!('nw-resize')

                // }else if(this.startX >= this.endX && this.startY <= this.endY){
                //     this.onCursorStyleChange!('ne-resize')

                // }else if(this.startX <= this.endX && this.startY >= this.endY){
                //     this.onCursorStyleChange!('sw-resize')

                // }else{
                this.drawRectangle(['topLeft'])
                // }
                break
            case 'n-resize':
                this.startX = this.topLeft.x + this.squareSize / 2
                this.startY = y
                this.endX = this.bottomRight.x + this.squareSize / 2
                this.endY = this.bottomRight.y + this.squareSize / 2
                this.drawRectangle(['bottomLeft', 'bottomMid', 'bottomRight'], 2)
                break
            case 's-resize':
                this.startX = this.bottomRight.x + this.squareSize / 2
                this.startY = y
                this.endX = this.topLeft.x + this.squareSize / 2
                this.endY = this.topLeft.y + this.squareSize / 2
                this.drawRectangle(['topLeft', 'topMid', 'topRight'], 2)
                break
            case 'w-resize':
                this.startX = x
                this.startY = this.topLeft.y + this.squareSize / 2
                this.endX = this.bottomRight.x + this.squareSize / 2
                this.endY = this.bottomRight.y + this.squareSize / 2
                this.drawRectangle(['topRight', 'bottomRight', 'midRight'], 1)
                break
            case 'e-resize':
                this.startX = x
                this.startY = this.topRight.y + this.squareSize / 2
                this.endX = this.bottomLeft.x + this.squareSize / 2
                this.endY = this.bottomLeft.y + this.squareSize / 2
                this.drawRectangle(['topLeft', 'bottomLeft', 'midLeft'], 1)
                break
            case 'move':
                // 计算鼠标的移动位移
                const deltaX = x - this.screenShotSizeUpdateStartMousePostion.x;
                const deltaY = y - this.screenShotSizeUpdateStartMousePostion.y;
                this.screenShotSizeUpdateStartMousePostion = {
                    x,y
                }
                this.screenMove({deltaX,deltaY})
                break;
        }
    }

    public screenShotSizeEndUpdateHandle = (e: MouseEvent, fixedMouseCursor: string) => {
        if (fixedMouseCursor.split('-')[0].length == 1) {
            if (fixedMouseCursor == 'n-resize' && this.startY > this.endY) {
                this.screenShotSizeUpdateHandle(e, 's-resize')
            } else if (fixedMouseCursor == 's-resize' && this.startY <= this.endY) {
                this.screenShotSizeUpdateHandle(e, 'n-resize')
            } else if (fixedMouseCursor == 'w-resize' && this.startX > this.endX) {
                this.screenShotSizeUpdateHandle(e, 'e-resize')
            } else if (fixedMouseCursor == 'e-resize' && this.startX <= this.endX) {
                this.screenShotSizeUpdateHandle(e, 'w-resize')
            }
        } else {
            if (this.startX > this.endX && this.startY < this.endY) {
                this.screenShotSizeUpdateHandle(e, 'ne-resize')
            } else if (this.startX < this.endX && this.startY > this.endY) {
                this.screenShotSizeUpdateHandle(e, 'sw-resize')
            } else if (this.startX > this.endX && this.startY > this.endY) {
                this.screenShotSizeUpdateHandle(e, 'se-resize')
            } else if (this.startX < this.endX && this.startY < this.endY) {
                this.screenShotSizeUpdateHandle(e, 'nw-resize')
            }
        }
    }
    private screenMove = ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
        // 获取 canvas 的宽度和高度
        const canvasWidth = this.canvas!.width;
        const canvasHeight = this.canvas!.height;
    
        // 矫正位移，使得矩形不会超出画布范围
        let correctedDeltaX = deltaX;
        let correctedDeltaY = deltaY;
    
        // 判断左上角与右下角是否超出边界
        const rectStartX = Math.min(this.startX + deltaX, this.endX + deltaX);
        const rectStartY = Math.min(this.startY + deltaY, this.endY + deltaY);
        const rectEndX = Math.max(this.startX + deltaX, this.endX + deltaX);
        const rectEndY = Math.max(this.startY + deltaY, this.endY + deltaY);
    
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
        this.startX += correctedDeltaX;
        this.startY += correctedDeltaY;
        this.endX += correctedDeltaX;
        this.endY += correctedDeltaY;
    
        // 更新四角和中间点的坐标
        const points = [
            this.topLeft,
            this.topRight,
            this.bottomLeft,
            this.bottomRight,
            this.topMid,
            this.bottomMid,
            this.midLeft,
            this.midRight,
        ];
        points.forEach((point) => {
            point.x += correctedDeltaX;
            point.y += correctedDeltaY;
        });
    
        const ctx = this.canvas!.getContext('2d')!;
    
        ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    
        // 计算矩形的宽度和高度
        const width = Math.abs(this.endX - this.startX);
        const height = Math.abs(this.endY - this.startY);
        const rectX = Math.min(this.startX, this.endX);
        const rectY = Math.min(this.startY, this.endY);
    
        ctx.strokeStyle = '#39C5BB';
        ctx.lineWidth = 2;
        ctx.strokeRect(rectX, rectY, width, height);
    
        ctx.fillStyle = '#39C5BB';
        this.draw(ctx);
    
        // 更新裁剪区域
        this.clip.startX = rectX;
        this.clip.startY = rectY;
        this.clip.endX = rectX + width;
        this.clip.endY = rectY + height;
    
        // 触发裁剪区域变化的回调
        if (this.onClipChange) {
            this.onClipChange(this.clip);
        }
    };
}