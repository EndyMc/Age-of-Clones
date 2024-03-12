import { Drawable } from "./Renderer.js";

export class Base extends Drawable {
    // Health which is left
    #hitPoints;
    #maxHitPoints;

    // The level of the base
//    #stage;

    /**
     * 
     * @param {number} hp The max-hp of the base
     */
    constructor(hp = 500) {
        super(0, 650, 200, 300);

        this.#hitPoints = hp;
        this.#maxHitPoints = hp;
    }

    get health() {
        return this.#hitPoints;
    }

    get maxHealth() {
        return this.#maxHitPoints;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        super.render(ctx);

        var x = this.position.x;
        var y = this.position.y - this.height / 4;
        
        var width = this.width;
        var height = width / 4;

        ctx.fillStyle = "#ccc";
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = "rgb(" + (255 * ( 1 - (this.health / this.maxHealth))) + ", " + (255 * (this.health / this.maxHealth)) + ", 0)";
        ctx.fillRect(x, y, width * (this.health / this.maxHealth), height);

        ctx.lineWidth = 5;
        ctx.lineCap = "round"
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, width, height);
    }    

    /**
     * 
     * @param {number} damage 
     */
    damaged(damage) {
        this.#hitPoints -= damage;
        if (this.#hitPoints <= 0) alert("Base Destroyed!");
    }
}