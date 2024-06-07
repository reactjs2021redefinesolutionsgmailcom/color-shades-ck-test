import { getBoundaries } from './schema.js';
import { hexToRgb, rgbToHsl, getBrightness } from './utils.js';

class ColorManager {
    constructor(input, index = 0) {
        this.index = index;
        const rgb = hexToRgb(input);
        this.hex = input.startsWith("#") ? input : `#${input}`;
        this.setRgb(rgb);
        this.setHsl(rgb);
        this.brightness = getBrightness(rgb);
        this.isDark = this.brightness < 180;
        this.isGray = this.saturation <= 0.5;
        if (this.index === 0) {
            this.setIndex();
        }
    }

    setRgb(rgb) {
        const { r, g, b } = rgb;
        this.red = r;
        this.green = g;
        this.blue = b;
        this.rgb = `rgb(${r}, ${g}, ${b})`;
    }

    setHsl(rgb) {
        const { h, s, l } = rgbToHsl(rgb);
        this.hue = h;
        this.saturation = s;
        this.luminance = l;
        this.hsl = `hsl(${h}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }

    setIndex() {
        const { boundaries } = getBoundaries(this.hue, this.isGray);
        const { index } = boundaries.find(({ brightness }) => {
            return (this.brightness > brightness.min && this.brightness <= brightness.max) || (this.brightness === 0 && brightness.min === 0);
        });
        this.index = index;
    }

    toString() {
        return this.hex;
    }

    toJSON() {
        return { [this.index]: this.hex };
    }
}

export default ColorManager;
