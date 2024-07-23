import variables from "/src/app/variables.module.scss";

export const v = {
    cardWidth: parseInt(variables.cardWidth),
    cardHeight: parseInt(variables.cardHeight),
    headerHeight: parseInt(variables.headerHeight),
    footerHeight: parseInt(variables.footerHeight),
}

export const checkBorderCollision = (x, y) => {
    if (x+v.cardWidth/2 > window.innerWidth) {
        x = window.innerWidth-v.cardWidth/2;
        console.log("right overlay")
    } else if (x-v.cardWidth/2 < 0) {
        x = v.cardWidth/2;
        console.log("left overlay")
    } else {
        x = x;
    }

    if (y+v.cardHeight/2 > window.innerHeight-v.footerHeight) {
        y = window.innerHeight-v.headerHeight-v.footerHeight;
        console.log("down overlay")
    } else if (y-v.cardHeight/2 < v.cardHeight/2) {
        y = v.cardHeight;
        console.log("top overlay")
    } else {
        y = y;
    }

    return [x, y];
}
    
export const ItemTypes = {
    CARD: 'card',
}

