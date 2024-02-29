import { ApplicationData } from "./Application.js";
import { Ground } from "./Background.js";
import { Drawable } from "./Renderer.js";

export class Unit extends Drawable {
    /**
     * The attack speed that this unit has.
     * Lowers the time between attacks.
     * @type {number}
    */
    #attackSpeed = 0;

    /**
     * The defence that this unit has.
     * Lowers the damage taken from enemy attacks (Cannot be lower than 1 dmg per attack).
     * @type {number}
    */
    #defence = 0;

    /**
     * The proficiency that this unit has.
     * Increases all other stats by a small amount and can only be increased by killing enemy units.
     * @type {number}
    */
    #proficiency = 0;

    /**
     * The health that this unit has.
     * Increases the amount of hits needed to kill this unit.
     * @type {number}
    */
    #hitPoints = 1;

    /**
     * The damage that this unit deals.
     * Lowers the amount of hits needed to kill the enemy unit.
     * @type {number}
    */
    #attackDamage = 1;

    /**
     * The speed that this unit has.
     * Raises the distance this can move in a tick
     * @type {number}
    */
    #movementSpeed = 1;

    /**
     * The range that this unit has.
     * Raises the distance between the unit and the enemy, when attacking for the first time.
     * @type {number}
     */
    #attackRange = 10;

    /**
     * @type {number}
     */
    #maxHitpoints = 0;

    /**
     * 
     * @param {UnitType} type 
     */
    constructor(type) {
        super();

        this.isEnemy = false;
        this.lastAttackTime = performance.now();

        // Move the unit to the ground plane
        this.position.y = Ground.position.y + (Ground.dimensions.height / 2) - this.height;

        this.#defence = type.baseDEF;

        this.#movementSpeed = type.baseSpeed;
        
        this.#attackDamage = type.baseDMG;
        this.#attackSpeed = type.baseATKSpeed;

        this.#attackRange = type.baseRange;

        this.#proficiency = Math.floor((type.baseDMG + type.baseDMG + type.baseSpeed) / 10);

        this.#hitPoints = type.baseHP + this.#proficiency;
        this.#maxHitpoints = type.baseHP;
    }

    get health() {
        return this.#hitPoints;
    }

    get maxHealth() {
        return this.#maxHitpoints;
    }

    get atkDamage() {
        return this.#attackDamage + this.#proficiency;
    }

    get speed() {
        return this.#movementSpeed + this.#proficiency * 0.5;
    }

    get atkSpeed() {
        return this.#attackSpeed + this.#proficiency * 0.5;
    }

    get defence() {
        return this.#defence + this.#proficiency;
    }

    get range() {
        return this.#attackRange;
    }

    update(delta = 16) {
        if (this.health < 10) delete this;

        if (this.position.x + this.range + this.width >= Math.min(ApplicationData.enemyUnits.map(u => u.position.x))) {
            // Attack the enemy which is in range
            return;
        }
        var movementDistance = this.speed/16 * Math.max(16, delta);

        this.moveBy(movementDistance, 0);

        if (this.position.x <= 100) this.moveTo(100);
        if (this.position.x >= 1900 - this.width) this.moveTo(100);
    }

    /**
     * @param {number} prof The proficiency of the enemy unit
     */
    enemyKilled(prof = 1) {
        prof = Math.max(1, prof);
        this.#proficiency += prof;
        this.#hitPoints += prof;
    }

    /**
     * This is called when this unit is getting hit by something
     * @param {number} damage 
     */
    damaged(damage) {
        this.#hitPoints -= Math.max(0, damage - this.defence);
        
        if (this.health <= 0) {
            ApplicationData.units = ApplicationData.units.filter(u => u.health > 0);
        }
    }
}

export class EnemyUnit extends Unit {
    /**
     * 
     * @param {UnitType} type 
     */
    constructor(type) {
        super(type);

        this.position.x = 1900;
        this.isEnemy = true;
    }

    update(delta = 16) {
        var closestTarget = ApplicationData.playerUnits.find(a => a.position.x == Math.max(ApplicationData.playerUnits.map(u => u.position.x)));

        if (closestTarget != undefined && this.position.x - this.range <= closestTarget.position.x + closestTarget.width) {
            // Check cooldown
            if (this.lastAttackTime + (1000 / this.atkSpeed) <= performance.now()) {
                // Reset cooldown
                this.lastAttackTime = performance.now();

                // Damage the enemy
                closestTarget.damaged(this.atkDamage);
            }

            return;
        }
        
        if (this.position.x <= 200 + UnitTypeEnum.basic.baseRange) {
            // Attack the base
            return;
        }

        var movementDistance = (-this.speed)/16 * Math.max(16, delta);
    
        this.moveBy(movementDistance, 0);
    }
}

export class UnitTypeEnum {
    static get basic() { return new UnitType(10, 2, 1, 1, 1, 25); }
    static get brute() { return new UnitType(10, 2, 0.7, 3, 0.5, 25); }
    static get tank() { return new UnitType(10, 2, 0.5, 5, 0.5, 25); }
    static get fast() { return new UnitType(10, 2, 1.7, 0, 2, 25); }
    static get ranged() { return new UnitType(10, 2, 1, 0, 2, 250); }
}

class UnitType {
    /**
     * Create a new type of Unit, mainly used as a template.
     * @param {number} baseHP Hitpoints at lvl 1
     * @param {number} baseDMG Damage at lvl 1
     * @param {number} baseSpeed Speed at lvl 1
     * @param {number} baseDEF Defence at lvl 1
     * @param {number} baseATKSpeed Attacks per Second at lvl 1
     * @param {number} baseRange Range
     */
    constructor(baseHP, baseDMG, baseSpeed = 1, baseDEF, baseATKSpeed, baseRange) {
        this.baseHP = baseHP;
        this.baseDMG = baseDMG;
        this.baseSpeed = baseSpeed;
        this.baseDEF = baseDEF;
        this.baseATKSpeed = baseATKSpeed;
        this.baseRange = baseRange;
    }
}