import ColorManager from "./colors.js";
import ShadesManager from "./shades.js";
import { CombinationManager } from "./combinations.js";

export function createColor(input, index = 0) {
    return new ColorManager(input, index);
}

export function createCombination(input, type, options) {
    return new CombinationManager(typeof input === "string" ? new ColorManager(input) : input, type, options);
}

export default function customCreateShades(input, count = 10) {
    return new ShadesManager(typeof input === "string" ? new ColorManager(input) : input, count);
}
