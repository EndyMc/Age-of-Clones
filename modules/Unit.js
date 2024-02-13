import { Drawable } from "./Renderer.js";

export class Unit extends Drawable {
    #hitPoints;
    #attackDamage;
    #movementSpeed;

    /**
     * 
     * @param {UnitType} type 
     */
    constructor(type) {
        super();

        this.#hitPoints = type.baseHP;
        this.#attackDamage = type.baseDMG;
        this.#movementSpeed = type.baseSpeed;
    }

    get hp() {
        return this.#hitPoints;
    }

    get dmg() {
        return this.#attackDamage;
    }

    get speed() {
        return this.#movementSpeed;
    }

    update() {
        console.log("Moving unit by: " + this.speed + "px");
        this.moveBy(this.speed, 0);

        if (this.position.x <= 100) this.moveTo(100);
        if (this.position.x >= 1900 - this.width) this.moveTo(100);
    }
}

export class UnitTypeEnum {
    static get basic() { return new UnitType(10, 2, 1); }
    static get brute() { return new UnitType(10, 2, 0.7); }
    static get tank() { return new UnitType(10, 2, 0.5); }
    static get fast() { return new UnitType(10, 2, 1.7); }
}

class UnitType {
    /**
     * Create a new type of Unit, mainly used as a template.
     * @param {number} baseHP Hitpoints at lvl 1
     * @param {number} baseDMG Damage at lvl 1
     * @param {number} baseSpeed Speed at lvl 1
     */
    constructor(baseHP, baseDMG, baseSpeed = 1) {
        this.baseHP = baseHP;
        this.baseDMG = baseDMG;
        this.baseSpeed = baseSpeed;
    }
}