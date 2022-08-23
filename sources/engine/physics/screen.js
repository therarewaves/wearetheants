import {CP} from './cpmovement.js'
import {capitalizeFirstLetter} from '../misc.js'

const screenMovingEdge = 200  /* a distance in pixels between the player and the playing field borders,
 crossing which, the screen is scrolling towards the player's moving direction */

const offsetDirectionDimensions = {
    [CP.N]: ['top'],
    [CP.S]: ['-top'],
    [CP.E]: ['-left'],
    [CP.W]: ['left'],
    [CP.NE]: ['top', '-left'],
    [CP.SE]: ['-top', '-left'],
    [CP.SW]: ['-top', 'left'],
    [CP.NW]: ['top', 'left']
}

export const moveScreen = mover => {
    offsetDirectionDimensions[mover.direction].forEach(offsetDirection => {
        const offsetCorrection = (offsetDirection.includes('-') ? -1 : 1),
            offsetDirectionClean = capitalizeFirstLetter(offsetDirection.replace('-', '')),
            offsetDimension = offsetDirectionClean.toLowerCase() === 'top' ? 'Height' : 'Width'

        const moverOffset = mover.unit[`offset${offsetDirectionClean}`],
            offset = mover.level.unit[`offset${offsetDirectionClean}`]
                + mover.speed * offsetCorrection

        const movingScreenCondition = offsetCorrection === -1 ?
            mover.level[`screen${offsetDimension}`]
            + moverOffset * offsetCorrection
            - mover.unit[`offset${offsetDimension}`]
            - mover.level.unit[`offset${offsetDirectionClean}`] <= screenMovingEdge :

            moverOffset + mover.level.unit[`offset${offsetDirectionClean}`] <= screenMovingEdge

        const controllingBoundsCondition =
            offsetCorrection === -1 ?
                mover.level.unit[`offset${offsetDimension}`] - Math.abs(offset) >=
                mover.level.container[`offset${offsetDimension}`] :

                mover.level.unit[`offset${offsetDirectionClean}`] < 0

        if (movingScreenCondition && controllingBoundsCondition)
            mover.level.unit.style[offsetDirectionClean.toLowerCase()] = `${offset}px`
    })
}

export let [mouseX, mouseY] = [0, 0]

document.addEventListener('mousemove', e =>
    [mouseX, mouseY] = [e.clientX, e.clientY])

export const getAbsoluteOffset = unit => {
    const rect = unit.getBoundingClientRect()
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
    }
}