import ShadesManager from './shades.js';
import ColorManager from './colors.js';
import { rgbToHex, hslToRgb, incrementHue, decrementHue } from './utils.js';

export class CombinationManager {
    constructor(baseColor, type, options) {
        this.baseColor = baseColor;
        this.type = type;
        this.options = options;
        switch (type) {
            case "opposite":
                this.result = new OppositeCombination(baseColor, options);
                break;
            case "triadic":
                this.result = new TriadicCombination(baseColor, { ...{ distance: 30 }, ...options });
                break;
            case "tetradic":
                this.result = new TetradicCombination(baseColor, { ...{ distance: 30 }, ...options });
                break;
            case "adjacent":
                this.result = new AdjacentCombination(baseColor, { ...{ distance: 30 }, ...options });
                break;
            default:
                throw new Error(`Combination with type ${type} not implemented`);
                break;
        }
    }

    get shades() {
        return [new ShadesManager(this.baseColor), ...this.result.shades];
    }

    get colors() {
        return [this.baseColor, ...this.result.shades.map((s) => s.colors.find(({ index }) => index === this.baseColor.index))];
    }
}

class CombinationAbstract {
    constructor(baseColor1, options1) {
        this.baseColor = baseColor1;
        this.options = options1;
        this.shades = [];
        this.handle();
    }

    handle() {
        throw new Error("Combination not implemented");
    }

    findOpposite() {
        return new ColorManager(rgbToHex(hslToRgb({
            h: incrementHue(this.baseColor.hue, 180),
            s: this.baseColor.saturation,
            l: this.baseColor.luminance
        })));
    }

    executeOperations(operations) {
        operations.map((op) => {
            const color = new ColorManager(
                rgbToHex(
                    hslToRgb({
                        h: op.increment
                            ? incrementHue(op.source.hue, op.distance ?? this.options.distance)
                            : decrementHue(op.source.hue, op.distance ?? this.options.distance),
                        s: op.source.saturation,
                        l: op.source.luminance,
                    })
                )
            );
            this.shades.push(new ShadesManager(color));
        });
    }
}

class OppositeCombination extends CombinationAbstract {
    handle() {
        this.shades.push(new ShadesManager(super.findOpposite()));
    }
}

class TriadicCombination extends CombinationAbstract {
    handle() {
        const opposite = this.findOpposite();
        const operations = [
            { source: opposite, increment: true },
            { source: opposite, increment: false },
        ];
        super.executeOperations(operations);
    }
}

class TetradicCombination extends CombinationAbstract {
    handle() {
        const opposite = this.findOpposite();
        const operations = [
            { source: this.baseColor, increment: true },
            { source: opposite, increment: true, distance: 0 },
            { source: opposite, increment: true },
        ];
        super.executeOperations(operations);
    }
}

class AdjacentCombination extends CombinationAbstract {
    handle() {
        const operations = [
            { source: this.baseColor, increment: true },
            { source: this.baseColor, increment: false },
        ];
        super.executeOperations(operations);
    }
}
