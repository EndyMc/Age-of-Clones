import { Base } from "./Base.js";
import Renderer from "./Renderer.js";
import { EnemyUnit, Unit, UnitTypeEnum } from "./Unit.js";

document.body.onload = () => {
    var unit = new Unit(UnitTypeEnum.fast);
    var enemyUnit = new EnemyUnit(UnitTypeEnum.ranged);

    ApplicationData.enemyBase.position.x = ApplicationData.renderer.canvas.width - ApplicationData.enemyBase.width;

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
}