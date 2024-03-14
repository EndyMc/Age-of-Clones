import { ApplicationData } from "./Application.js";
import { Drawable } from "./Renderer.js";

export class CloneImageComposer {
    static LEVEL_COLORS = [ "#fff", "yellow", "green", "blue", "red", "orange", "pink", "purple", "gold", "black" ];

    isMoving = false;
    movementFrame = 0;
    lastMovementChange = 0;

    isAttacking = false;
    attackFrame = 0;
    lastAttackChange = 0;

    /**
     * Create an image of how the clone would look, with the inputted levels and effects.
     * @param {boolean} isEnemy Whether or not this is the enemy unit
     * @param {number} speed The level
     * @param {number} damage The level
     * @param {number} defence The level
     * @param {number} range The level
     * @param {number} proficiency The level
     * @returns {HTMLCanvasElement}
     */
    compose(isEnemy = false, isMoving = false, isAttacking = false, speed = 1, damage = 1, defence = 1, range = 1, proficiency = 1) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        var drawable = new Drawable();
        canvas.width = drawable.width;
        canvas.height = drawable.height;
        
        this.isMoving = isMoving;
        this.isAttacking = isAttacking;

        if (this.isMoving) {
            var now = performance.now();
            if (now - this.lastMovementChange >= 150) {
                this.lastMovementChange = now;
                this.movementFrame = (this.movementFrame + 1) % 6;
            }
        } else {
            this.movementFrame = 1;
        }

        if (isEnemy) {
            ctx.drawImage(ApplicationData.images["Enemy-Legs-Sheet"], this.movementFrame * 50, 0, 50, 100, 0, 0, 50, 100);
        } else {
            ctx.drawImage(ApplicationData.images["Legs-Sheet"], this.movementFrame * 50, 0, 50, 100, 0, 0, 50, 100);
        }


        // Base body - Red if enemy, otherwise it's light blue/white
        // Shoes - Affected by SPEED
        // Weapon - Affected by DAMAGE
        // Armor - Affected by DEFENCE
        // Eyes - Affected by RANGE
        // Hair/Knot - Affected by PROFICIENCY

        return canvas;
    }
}

class Eyes {

}

class Hair {

}

class Armor {

}