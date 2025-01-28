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
    topLeft: Point = { x: 0, y: 0 };
    topMid: Point = { x: 0, y: 0 };
    topRight: Point = { x: 0, y: 0 };
    midLeft: Point = { x: 0, y: 0 };
    midRight: Point = { x: 0, y: 0 };
    bottomLeft: Point = { x: 0, y: 0 };
    bottomMid: Point = { x: 0, y: 0 };
    bottomRight: Point = { x: 0, y: 0 };
}