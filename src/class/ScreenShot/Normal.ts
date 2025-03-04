/*
 * @Description: create by southernMD
 */
// normal.ts
import { Point } from "./otherType";

export class Normal {
    startX: number = 0;
    startY: number = 0;
    endX: number = 0;
    endY: number = 0;
    squareSize: number = 5;
    lineWidth: number = 2;
    color:string = "#39C5BB";
    topLeft: Point = { x: 0, y: 0 };
    topMid: Point = { x: 0, y: 0 };
    topRight: Point = { x: 0, y: 0 };
    midLeft: Point = { x: 0, y: 0 };
    midRight: Point = { x: 0, y: 0 };
    bottomLeft: Point = { x: 0, y: 0 };
    bottomMid: Point = { x: 0, y: 0 };
    bottomRight: Point = { x: 0, y: 0 };
    public getPostionPoints() {
        return {
            topLeft: this.topLeft,
            topMid: this.topMid,
            topRight: this.topRight,
            midLeft: this.midLeft,
            midRight: this.midRight,
            bottomLeft: this.bottomLeft,
            bottomMid: this.bottomMid,
            bottomRight: this.bottomRight,
        }
    }
}