import { ApplicationData } from "./Application.js";
import { Drawable } from "./Renderer.js";

export class CloneImageComposer {
    static LEVEL_COLORS = [ 0xffffff, 0xffff00, 0x00ff00, 0x0000ff, 0xff0000, 0xffa500, 0xff6ec7, 0xa020f0, 0xffd700, 0x000000 ];
    static TRANSFORMED_IMAGES = {};

    isMoving = false;
    movementFrame = 0;
    lastMovementChange = 0;

    isAttacking = false;
    attackFrame = 0;
    lastAttackChange = 0;

    #speed;
    #damage;
    #defence;
    #range;

    /**
     * 
     * @param {boolean} isEnemy Whether or not this is the enemy unit
     * @param {number} speed The level
     * @param {number} damage The level
     * @param {number} defence The level
     * @param {number} range The level
     * @param {number} proficiency The level
     */
    constructor(isEnemy = false, speed = 0, damage = 0, defence = 0, range = 0, proficiency = 0) {
        this.isEnemy = isEnemy;
        this.#speed = speed;
        this.#damage = damage;
        this.#defence = defence;
        this.#range = range;
        this.proficiency = proficiency;
    }

    get speed() { return this.#speed; }
    get damage() { return this.#damage; }
    get defence() { return this.#defence; }
    get range() { return this.#range; }

    /**
     * Create an image of how the clone would look.
     * @returns {HTMLCanvasElement}
     */
    compose(isMoving = false, isAttacking = false) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        var drawable = new Drawable();
        canvas.width = drawable.width;
        canvas.height = drawable.height;
        
        this.isMoving = isMoving;
        this.isAttacking = isAttacking;
        
        // Base body - Red if enemy, otherwise it's light blue/white
        // // Head
        var head;
        if (this.isEnemy) {
            head = this.flip("Head");
        } else {
            head = ApplicationData.images["Head"];
        }

        ctx.drawImage(head, 0, 0, canvas.width, canvas.height);

        // // Legs with or without walking animation
        if (this.isMoving) {
            var now = performance.now();
            if (now - this.lastMovementChange >= 100) {
                this.lastMovementChange = now;
                this.movementFrame = (this.movementFrame + 1) % 6;
            }
        } else {
            this.movementFrame = 1;
        }

        if (this.isEnemy) {
            ctx.drawImage(ApplicationData.images["Enemy-Legs-Sheet"], this.movementFrame * drawable.width, 0, drawable.width, drawable.height, 0, 0, drawable.width, drawable.height);
        } else {
            ctx.drawImage(ApplicationData.images["Legs-Sheet"], this.movementFrame * drawable.width, 0, drawable.width, drawable.height, 0, 0, drawable.width, drawable.height);
        }
        
        // Shoes - Affected by SPEED
        // Weapon - Affected by DAMAGE
        // Armor - Affected by DEFENCE
        var armor;

        if (this.isEnemy) {
            armor = this.flip("Torso", CloneImageComposer.LEVEL_COLORS[this.defence]);
        } else {
            armor = this.recolor("Torso", CloneImageComposer.LEVEL_COLORS[this.defence]);
        }
        ctx.drawImage(armor, 0, 0, canvas.width, canvas.height);

        // Eyes - Affected by RANGE
        // Hair/Knot - Affected by PROFICIENCY

        return canvas;
    }

    /**
     * 
     * @param {string} imageName
     * @param {number} color
     * @returns {HTMLCanvasElement} 
     */
    recolor(imageName, color) {
        if (CloneImageComposer.TRANSFORMED_IMAGES[imageName]?.["" + color] != undefined) {
            return CloneImageComposer.TRANSFORMED_IMAGES[imageName]["" + color];
        }

        var image = this.getImageData(ApplicationData.images[imageName]);

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        var transformedImage = ctx.createImageData(image.width, image.height);

        canvas.width = image.width;
        canvas.height = image.height;

        var r = (color >>> 16) & 0xff;
        var g = (color >>>  8) & 0xff;
        var b = color          & 0xff;

        for (var i = 0; i < image.data.length; i += 4) {
            if (image.data[i + 3] == 0) continue;

            transformedImage.data[i + 0] = Math.round(image.data[i + 0] * (r / 255));
            transformedImage.data[i + 1] = Math.round(image.data[i + 1] * (g / 255));
            transformedImage.data[i + 2] = Math.round(image.data[i + 2] * (b / 255));
            transformedImage.data[i + 3] = 255;
        }

        ctx.putImageData(transformedImage, 0, 0);

        if (CloneImageComposer.TRANSFORMED_IMAGES[imageName] == undefined) CloneImageComposer.TRANSFORMED_IMAGES[imageName] = {};
        CloneImageComposer.TRANSFORMED_IMAGES[imageName]["" + color] = canvas;

        return canvas;
    }

    /**
     * 
     * @param {string} imageName 
     * @param {number} color 
     * @returns {HTMLCanvasElement}
     */
    flip(imageName, color = undefined) {
        if (CloneImageComposer.TRANSFORMED_IMAGES[imageName]?.["flip" + color] != undefined) {
            return CloneImageComposer.TRANSFORMED_IMAGES[imageName]["flip" + color];
        }

        var image;
        if (color == undefined) {
            var imageToFlip = ApplicationData.images[imageName];

            image = document.createElement("canvas");

            image.width = imageToFlip.width;
            image.height = imageToFlip.height;

            image.getContext("2d").drawImage(imageToFlip, 0, 0);
        } else {
            image = this.recolor(imageName, color);
        }
        
        var imageData = image.getContext("2d").getImageData(0, 0, image.width, image.height);

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        var flippedImage = ctx.createImageData(image.width, image.height);
        for (var y = 0; y < flippedImage.height; y++) {
            for (var x = 0; x < flippedImage.width; x++) {
                var source = (flippedImage.width - x) * 4 + y * flippedImage.width * 4;
                var destination = x * 4 + y * flippedImage.width * 4;

                if (imageData.data[source + 3] == 0 && imageData.data[destination + 3] == 0) continue;

                flippedImage.data[destination + 0] = imageData.data[source + 0];
                flippedImage.data[destination + 1] = imageData.data[source + 1];
                flippedImage.data[destination + 2] = imageData.data[source + 2];
                flippedImage.data[destination + 3] = imageData.data[source + 3];
            }
        }

        ctx.putImageData(flippedImage, 0, 0);

        if (CloneImageComposer.TRANSFORMED_IMAGES[imageName] == undefined) CloneImageComposer.TRANSFORMED_IMAGES[imageName] = {};
        CloneImageComposer.TRANSFORMED_IMAGES[imageName]["flip" + color] = canvas;

        return canvas;
    }

    /**
     * Transforms an Image element into ImageData
     * @param {HTMLImageElement} image 
     * @returns {ImageData}
     */
    getImageData(image) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0);
        
        return context.getImageData(0, 0, image.width, image.height);
    }
}

window.C = CloneImageComposer;