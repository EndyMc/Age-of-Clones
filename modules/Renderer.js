import { ApplicationData } from "./Application.js";
import { Background } from "./Background.js";

export default class Renderer {
    /** @type {CanvasRenderingContext2D} */
    #renderingContext;

    /** @type {HTMLCanvasElement} */
    #canvas;

    constructor() {
        this.#canvas = document.querySelector("canvas");
        this.#renderingContext = this.#canvas.getContext("2d");
    }

    get renderingContext() {
        return this.#renderingContext;
    }

    get canvas() {
        return this.#canvas;
    }

    render() {
        console.time("Total");
        requestAnimationFrame(ApplicationData.renderer.render);

        console.group("Update");
        console.time("Update");

        // Spawn enemies

        // Move all units
        console.group("Units (Count: " + ApplicationData.units.length + ")");
        ApplicationData.units.forEach(unit => unit.update());
        console.groupEnd();

        console.timeEnd("Update");
        console.groupEnd();

        console.group("Render");
        console.time("Render");
        
        var ctx = ApplicationData.renderer.renderingContext;

        ctx.clearRect(0, 0, 2000, 1000);

        // Render Background
        console.group("Background");
        Background.render(ctx);
        console.groupEnd();

        // Render Units
        console.group("Units (Count: " + ApplicationData.units.length + ")");
        ApplicationData.units.forEach(unit => unit.render(ctx));
        console.groupEnd();

        // Render Bases

        console.timeEnd("Render");
        console.groupEnd();

        console.timeEnd("Total");
    }
}

export class Drawable {
    #sprite;
    
    /** @type {{ x: number, y: number }} */
    #position = { x: 0, y: 0 };

    /**
     * Render the sprite
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        if (this.sprite != undefined) {
            // Draw sprite
            ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.position.x + this.width, this.position.y);
            ctx.lineTo(this.position.x, this.position.y + this.height);
            ctx.stroke();
        }
    }

    get position() {
        return this.#position;
    }

    get sprite() {
        return this.#sprite;
    }

    get width() {
        return 50;
    }

    get height() {
        return 100;
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveBy(x, y) {
        this.moveTo(this.position.x + x, this.position.y + y);
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveTo(x, y) {
        this.#position.x = x || this.position.x;
        this.#position.y = y || this.position.y;
    }
}