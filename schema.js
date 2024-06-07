import boundaries from './data/boundaries.js';

export const indexes = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export function getGrayBoundaries() {
    return boundaries.filter(boundary => boundary.isGray);
}

export function getColorBoundaries() {
    return boundaries.filter(boundary => !boundary.isGray);
}

export function getBoundaries(hue, isGray = false) {
    const filteredBoundaries = isGray ? getGrayBoundaries() : getColorBoundaries();

    if (hue === 0) {
        return filteredBoundaries[filteredBoundaries.length - 1];
    }

    return filteredBoundaries.find(boundary => hue > boundary.min && hue <= boundary.max);
}
