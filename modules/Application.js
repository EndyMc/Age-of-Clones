import { Base } from "./Base.js";
import Renderer from "./Renderer.js";
import { EnemyUnit, Unit, UnitTypeEnum } from "./Unit.js";

document.body.onload = async () => {
    var unit = new Unit(UnitTypeEnum.fast);
    var enemyUnit = new EnemyUnit(UnitTypeEnum.ranged);

    ApplicationData.enemyBase.position.x = ApplicationData.renderer.canvas.width - ApplicationData.enemyBase.width;

    for (var i = 0; i < ApplicationData.IMAGES_TO_LOAD.length; i++) {
        var image = new Image();
        image.src = "sprites/" + ApplicationData.IMAGES_TO_LOAD[i] + ".png";
        console.log("Loading: " + image.src);
        await new Promise((resolve, reject) => {
            image.onload = (ev) => {
                ApplicationData.images[ApplicationData.IMAGES_TO_LOAD[i]] = image;
                console.log("Loaded: " + image.src);
                resolve();
            }
        });
    }

    console.log(ApplicationData.images);

    ApplicationData.units.push(...[ unit, enemyUnit ]);
    ApplicationData.renderer.render();
}

export class ApplicationData {
    /** @type {Unit[]} */
    static units = [];

    static get playerUnits() {
        return ApplicationData.units.filter(u => !u.isEnemy);
    }

    static get enemyUnits() {
        return ApplicationData.units.filter(u => u.isEnemy);
    }


    static playerBase = new Base(500);
    static enemyBase = new Base(500);

    /** @type {Renderer} */
    static renderer = new Renderer();

    static images = {};
    static IMAGES_TO_LOAD = [ "Legs-Sheet", "Enemy-Legs-Sheet" ];
}