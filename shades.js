import ColorManager from './colors.js';
import { getBoundaries } from './schema.js';
import { hslToRgb, rgbToHex, getBrightness } from './utils.js';

class ShadesManager {
    constructor(baseColor, count = 10) {
        this.count = count;
        this.colors = [baseColor];
        this._boundaries = getBoundaries(baseColor.hue, baseColor.isGray);
        this.name = this._boundaries.name;
        this._generate();
    }

    _boundariesForIndex(index) {
        return this._boundaries.boundaries.find((b) => b.index === index);
    }

    _inBoundaries(brightness, boundaries) {
        const { brightness: bb } = boundaries;
        return brightness > bb.min && brightness <= bb.max;
    }

    toJSON() {
        let obj = {};
        this.colors.map((c) => Object.assign(obj, c.toJSON()));
        return obj;
    }

    _generate() {
        const baseIndex = this.colors[0].index;
        const afterIndexes = this._boundaries.boundaries.map(({ index }) => index);
        const beforeIndexes = afterIndexes.splice(afterIndexes.indexOf(baseIndex));
        const indexes = [...beforeIndexes, ...[...afterIndexes, baseIndex].reverse()];
        for (let i = 0; i < indexes.length; i++) {
            if (indexes[i] === baseIndex) continue;
            try {
                const previousColor = this.colors.find((c) => c.index === indexes[i - 1]);
                this.colors.push(this._findColor(previousColor, indexes[i]));
            } catch {
                console.error(`Could not define color at index ${indexes[i]}`);
            }
        }
        this.colors.sort((a, b) => (a.index > b.index ? 1 : -1));
    }

    _findColor(previousColor, index) {
        const isAfter = index > previousColor.index;
        const guide = this._boundariesForIndex(previousColor.index);
        const boundaries = this._boundariesForIndex(index);
        let brightness = 0;
        let i = 0;
        let rgb;

        while (!this._inBoundaries(brightness, boundaries)) {
            const variator = i === 0
                ? 1
                : brightness <= boundaries.brightness.min
                    ? 1.01 + 0.005 * i
                    : brightness > boundaries.brightness.max
                        ? 0.99 - 0.005 * i
                        : 1;

            rgb = hslToRgb({
                h: previousColor.hue + (isAfter ? guide.hue.next : guide.hue.prev),
                s: previousColor.saturation + (isAfter ? guide.saturation.next : guide.saturation.prev),
                l: (previousColor.luminance + (isAfter ? guide.luminance.next : guide.luminance.prev)) * variator,
            });

            brightness = getBrightness(rgb);
            if (i >= 100) {
                break;
            }
            i++;
        }

        return new ColorManager(rgbToHex(rgb), index);
    }
}

export default ShadesManager;
