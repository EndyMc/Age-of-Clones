export class Background {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    static render(ctx) {
        // Sky
        // Mountains etc. / Further background
        // Forest / Closer background
        // Ground
        Ground.render(ctx);
    }

}

export class Ground {
    static position = { x: 0, y: 900 };
    static dimensions = { width: 2000, height: 100 };

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    static render(ctx) {
        ctx.fillStyle = "beige";
        ctx.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height);
    }
}