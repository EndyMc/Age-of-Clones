import Renderer from "./Renderer.js";
import { EnemyUnit, Unit, UnitTypeEnum } from "./Unit.js";

document.body.onload = () => {
    var unit = new Unit(UnitTypeEnum.fast);
    var enemyUnit = new EnemyUnit(UnitTypeEnum.ranged);

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


    /** @type {Renderer} */
    static renderer = new Renderer();
}