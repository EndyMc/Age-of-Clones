export class Background {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    static render(ctx) {
        // Mountains etc. / Further background
        // Forest / Closer background
        // Ground
        console.group("Ground");
        Ground.render(ctx);
        console.groupEnd();
    }

}

class Ground {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    static render(ctx) {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 900, 2000, 100);
    }
}