import { ApplicationData } from "./Application.js";
import { Drawable } from "./Renderer.js";
import { EnemyUnit, UnitType } from "./Unit.js";

export class Base extends Drawable {
    static UNIT_PLACEMENT_COOLDOWN = 2_000;
    static UPGRADE_COOLDOWN = 10_000;

    #lastUnitPlacedTime;
    #lastUpgradeTime;

    // Health which is left
    #hitPoints;
    #maxHitPoints;

    isCPUBase = false;

    // Levels which the units can spawn with
    unitLevels = new UnitType(1, 1, 1, 1, 1, 1);
    
    // The level of the base
//    #stage;

    /**
     * 
     * @param {number} hp The max-hp of the base
     * @param {boolean} isCPUBase If this is controlled by the computer
     */
    constructor(hp = 500, isCPUBase) {
        super(0, 650, 200, 300);

        this.#hitPoints = hp;
        this.#maxHitPoints = hp;

        this.#lastUnitPlacedTime = performance.now();
        this.#lastUpgradeTime = performance.now();

        this.isCPUBase = isCPUBase;
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

        if (this.isCPUBase && now - this.#lastUnitPlacedTime >= 1_000) {
            this.#lastUnitPlacedTime = now;

            var unit = new EnemyUnit(this.unitLevels);
            ApplicationData.units.push(unit);
        }
    }

    update() {
        if (this.isCPUBase) {
            var now = performance.now();
            if (now - this.#lastUpgradeTime >= Base.UPGRADE_COOLDOWN && !this.unitLevels.isMax()) {
                this.#lastUpgradeTime = now;

                this.unitLevels.upgrade();
            }

            if (now - this.#lastUnitPlacedTime >= Base.UNIT_PLACEMENT_COOLDOWN) {
                this.#lastUnitPlacedTime = now;

                if (ApplicationData.enemyUnits.length >= 10) return;

                var unit = new EnemyUnit(this.unitLevels);
                ApplicationData.units.push(unit);
            }
        }
    }
}