import Renderer from "./Renderer.js";
import { Unit, UnitTypeEnum } from "./Unit.js";

document.body.onload = () => {
    console.group("OnLoad");
    
    var unit = new Unit(UnitTypeEnum.fast);

    unit.moveTo(0, 950 - unit.height);

    ApplicationData.units.push(unit);
    ApplicationData.renderer.render();

    console.log("End");
    console.groupEnd();
}

export class ApplicationData {
    /** @type {Unit[]} */
    static units = [];

    /** @type {Renderer} */
    static renderer = new Renderer();
}