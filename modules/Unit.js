import { ApplicationData } from "./Application.js";
import { Ground } from "./Background.js";
import { CloneImageComposer } from "./CloneComposer.js";
import { Drawable } from "./Renderer.js";

export class Unit extends Drawable {
    static MAX_UNIT_LEVEL = 10;

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

    isAttacking = false;
    isMoving = false;

    /**
     * 
     * @param {UnitType} type 
     */
    constructor(type) {
        super(200 + UnitTypeEnum.basic.baseRange)

        this.isEnemy = false;
        this.lastAttackTime = performance.now();

        // Move the unit to the ground plane
        this.position.y = Ground.position.y + (Ground.dimensions.height / 2) - this.height;

        this.#defence = type.baseDEF;

        this.#movementSpeed = type.baseSpeed;
        
        this.#attackDamage = type.baseDMG;
        this.#attackSpeed = type.baseATKSpeed;

        this.#attackRange = type.baseRange;

        this.#proficiency = Math.floor((type.baseDMG * 2 + type.baseSpeed) / 3);

        this.#hitPoints = type.baseHP + this.#proficiency;
        this.#maxHitpoints = type.baseHP;

        this.imageComposer = new CloneImageComposer(this.isEnemy, this.#movementSpeed, this.#attackDamage, this.#defence, this.#attackRange, this.#proficiency);
    }

    get health() {
        return this.#hitPoints * 5;
    }

    get maxHealth() {
        return this.#maxHitpoints * 5;
    }

    get atkDamage() {
        return (this.#attackDamage + this.#proficiency) * 7;
    }

    get speed() {
        return (this.#movementSpeed + this.#proficiency * 0.5) * 1;
    }

    get atkSpeed() {
        return (this.#attackSpeed + this.#proficiency * 0.5) * 1;
    }

    get defence() {
        return (this.#defence + this.#proficiency) * 2;
    }

    get range() {
        return (this.#attackRange) * 10;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        this.sprite = this.imageComposer.compose(this.isMoving, false);

        super.render(ctx);

        if (this.health % this.maxHealth != 0) {
            var x = this.position.x;
            var y = this.position.y - this.height / 4;
            
            var width = this.width;
            var height = width / 4;

            ctx.fillStyle = "#ccc";
            ctx.fillRect(x, y, width, height);

            ctx.fillStyle = "rgb(" + (255 * (1 - Math.min(1, this.health / this.maxHealth))) + ", " + (255 * Math.min(1, this.health / this.maxHealth)) + ", 0)";
            ctx.fillRect(x, y, width * Math.min(1, this.health / this.maxHealth), height);

            // Overheal/shield
            ctx.fillStyle = "blue";
            ctx.fillRect(x, y, width * Math.min(1, this.health / this.maxHealth - 1), height);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.strokeText(this.health + " / " + this.maxHealth, x + width / 2, y + height / 2);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";

            ctx.lineWidth = 5;
            ctx.lineCap = "round"
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, y, width, height);
        }
    }

    update(delta = 16) {
        this.isMoving = false;
        if (this.position.x + this.range + this.width >= Math.min(ApplicationData.enemyUnits.map(u => u.position.x))) {
            // Attack the enemy which is in range
            return;
        }
        var movementDistance = this.speed/16 * Math.max(16, delta);

        this.moveBy(movementDistance, 0);
        this.isMoving = true;

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

        this.position.x = 1800 - UnitTypeEnum.basic.baseRange - this.width;

        this.imageComposer.isEnemy = true;
        this.isEnemy = true;
    }

    update(delta = 16) {
        this.isMoving = false;
        var closestTarget = ApplicationData.playerUnits.find(a => a.position.x == Math.max(ApplicationData.playerUnits.map(u => u.position.x)));
        if (closestTarget != undefined && this.position.x - this.range <= closestTarget.position.x + closestTarget.width) {
            // Attack the closest target
            // Check cooldown
            if (this.lastAttackTime + (1000 / this.atkSpeed) <= performance.now()) {
                // Reset cooldown
                this.lastAttackTime = performance.now();

                // Damage the enemy
                closestTarget.damaged(this.atkDamage);
            }

            if (this.position.x - UnitTypeEnum.basic.baseRange <= closestTarget.position.x + closestTarget.width) {
                return;
            }
        } else if (closestTarget == undefined && this.position.x - this.range <= ApplicationData.playerBase.position.x + ApplicationData.playerBase.width) {
            // Attack the base
            // Check cooldown
            if (this.lastAttackTime + (1000 / this.atkSpeed) <= performance.now()) {
                // Reset cooldown
                this.lastAttackTime = performance.now();

                // Damage the enemy
                ApplicationData.playerBase.damaged(this.atkDamage)
            }
        }

        var ownIndex = ApplicationData.enemyUnits.findIndex((val) => val == this);
        var closestAlly = ownIndex == 0 ? undefined : ApplicationData.enemyUnits[ownIndex - 1];

        if (this.position.x <= ApplicationData.playerBase.position.x + ApplicationData.playerBase.width) {
            // Don't move through the base
            return;
        } else if (closestAlly != undefined && this.position.x <= closestAlly.position.x + closestAlly.width) {
            // Don't move through own troops
            return;
        }

        var movementDistance = (-this.speed)/16 * Math.max(16, delta);
    
        this.moveBy(movementDistance, 0);
        this.isMoving = true;
    }
}

export class UnitTypeEnum {
    static get basic() { return new UnitType(10, 2, 1, 1, 1, 25); }
    static get brute() { return new UnitType(10, 2, 0.7, 3, 0.5, 25); }
    static get tank() { return new UnitType(10, 2, 0.5, 5, 0.5, 25); }
    static get fast() { return new UnitType(10, 2, 2, 0, 2, 25); }
    static get ranged() { return new UnitType(10, 20, 1, 0, 2, 250); }
}

export class UnitType {
    /**
     * Create a new type of Unit.
     * @param {number} baseHP Hitpoints
     * @param {number} baseDMG Damage
     * @param {number} baseSpeed Speed
     * @param {number} baseDEF Defence
     * @param {number} baseATKSpeed Attacks per Second
     * @param {number} baseRange Range
     */
    constructor(baseHP, baseDMG, baseSpeed, baseDEF, baseATKSpeed, baseRange) {
        this.baseHP = baseHP;
        this.baseDMG = baseDMG;
        this.baseSpeed = baseSpeed;
        this.baseDEF = baseDEF;
        this.baseATKSpeed = baseATKSpeed;
        this.baseRange = baseRange;
    }

    /**
     * 
     * @param {string | undefined} attribute 
     */
    upgrade(attribute) {
        if (attribute != undefined) {
            if (this[attribute] >= Unit.MAX_UNIT_LEVEL) throw "Error, Attribute (" + attribute + ") is too high level to be upgraded";
            this[attribute] += 1;
        } else {
            var attributes = [ "baseHP", "baseDMG", "baseSpeed", "baseDEF", "baseATKSpeed", "baseRange" ];
            for (var i = 0; i < attributes.length; i++) {
                if (this[attributes[i]] >= Unit.MAX_UNIT_LEVEL) {
                    attributes.splice(i, 1);
                    i -= 1;
                }
            }

            var attribute = attributes[Math.floor(Math.random() * attributes.length)];

            this[attribute] += 1;
        }
    }

    /**
     * @returns {boolean}
     */
    isMax() {
        var maxLevel = Unit.MAX_UNIT_LEVEL;
        return this.baseATKSpeed == maxLevel && this.baseDEF == maxLevel && this.baseDMG == maxLevel && this.baseHP == maxLevel && this.baseRange == maxLevel && this.baseSpeed == maxLevel;
    }
}