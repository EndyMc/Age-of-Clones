import { ApplicationData } from "./Application.js";
import { Background } from "./Background.js";

export default class Renderer {
    /** @type {number[]} */
    #frames = [];

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

    get fps() {
        return this.#frames.length;
    }

    addFrame(time = performance.now()) {
        this.#frames = this.#frames.filter(frame => frame > time - 1000);
        this.#frames.push(time);
    }

    render(timestamp = 0) {
        requestAnimationFrame(ApplicationData.renderer.render);

        // ## Debug
        var start = performance.now();
        var elapsed = start - timestamp;
        
        ApplicationData.renderer.addFrame(start);
        console.debug("Elapsed: " + elapsed, "FPS: " + ApplicationData.renderer.fps);
        
        // ## Update
        
        // Spawn enemies
        ApplicationData.playerBase.update();
        ApplicationData.enemyBase.update();

        // Move all units
        ApplicationData.units.forEach(unit => unit.update(elapsed));
        

        // ## Render
        var ctx = ApplicationData.renderer.renderingContext;

        ctx.clearRect(0, 0, 2000, 1000);

        // Render Background
        Background.render(ctx);

        // Render Units
        ApplicationData.units.forEach(unit => unit.render(ctx));

        // Render Bases
        ApplicationData.playerBase.render(ctx);
        ApplicationData.enemyBase.render(ctx);
    }
}

export class Drawable {
    sprite;
    
    /** @type {{ x: number, y: number }} */
    #position = { x: 0, y: 0 };

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0, width = 50, height = 100, sprite) {
        this.moveTo(x, y);

        this.width = width;
        this.height = height;

        this.sprite = sprite;
    }

    /**
     * Render the sprite
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        if (this.sprite != undefined) {
            // Draw sprite
            ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.lineWidth = 1;
            ctx.lineCap = "square";
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

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    moveBy(x = 0, y = 0) {
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