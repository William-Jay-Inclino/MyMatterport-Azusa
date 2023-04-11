import type { TagColor } from "@/stores/types";
export function isBgLight(color:any) {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    }
    else {
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 140) {

        return true;
    }
    else {

        return false;
    }
}

export function extractRGBValues(rgbString:string) {
    var match = rgbString.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);

    return match ? {
        red: Number(match[1]),
        green: Number(match[2]),
        blue: Number(match[3])
    } : { red: 0, green: 0, blue: 0 };
}

export function convertToCssRgb(values:{r:number,g:number,b:number}) {
    // console.log('convertToCssRgb()', values)

    if(!values){
        console.log('values is undefined')
        return 
    }

    let r = Math.round(values.r * 255)
    let g = Math.round(values.g * 255)
    let b = Math.round(values.b * 255)

    return `rgb(${r},${g},${b})`
}

export function useHexToRgb(e:any) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e.target.value);
    let r,g,b
    if (result) {
        r = parseInt(result[1], 16)
        g = parseInt(result[2], 16)
        b = parseInt(result[3], 16)
    }
    return `rgb(${r},${g},${b})`
}