import {getCenterCoordinates, swapDict} from '../misc.js'
import {removeClassByMask} from '../../ui/elements.js'


export const defineLocationSector = (obj) => {
    obj.sector = parseInt(`${Math.trunc((obj.unit.offsetLeft + obj.width / 2) / 200)}` +
        `${Math.trunc((obj.unit.offsetTop + obj.height / 2) / 200)}`)
}

// cardinal points
export const CP = {
    'N': 1,
    'NE': 2,
    'E': 3,
    'SE': 4,
    'S': 5,
    'SW': 6,
    'W': 7,
    'NW': 8
}

export const CPR = swapDict(CP)  // cardinalPointsReversed

export class CpMovement {
    constructor() {
        this.level = undefined
        this.unit = undefined
        this.height = 0
        this.width = 0
        this.speed = 0
    }

    go = direction => {
        let x = 0, y = 0
        ;[CP.NW, CP.N, CP.NE].includes(direction) && (y = -1) || [CP.SW, CP.S, CP.SE].includes(direction) && (y = 1)
        ;[CP.NE, CP.E, CP.SE].includes(direction) && (x = 1) || [CP.NW, CP.W, CP.SW].includes(direction) && (x = -1)

        let left = this.unit.offsetLeft + x * this.speed,
            top = this.unit.offsetTop + y * this.speed

        left < 0 && (left = 0) || left + this.width >= this.level.width
        && (left = this.level.width - this.width)

        top < 0 && (top = 0) || top + this.height >= this.level.height
        && (top = this.level.height - this.height)

        Object.assign(this.unit.style, {left: `${left}px`, top: `${top}px`})
    }

    changeMoveSprite = direction => {
        if (!direction) return
        const obj = this['type'] === 'player' ? this['body'] : this['unit']
        obj.classList.forEach(cl =>
            cl.includes('move') && obj.classList.remove(cl))

        obj.classList.add(`move_${
            CPR[this.correctMovingDirection(direction)]}`)
    }

    correctMovingDirection = direction => {
        switch (direction) {
            case CP.NW:
                if (this.unit.offsetLeft === 0) return CP.N
                if (this.unit.offsetTop === 0) return CP.W
                break

            case CP.SW:
                if (this.unit.offsetLeft === 0) return CP.S
                if (this.unit.offsetTop + this.height === this.level.height) return CP.W
                break

            case CP.NE:
                if (this.unit.offsetTop === 0) return CP.E
                if (this.unit.offsetLeft + this.width === this.level.width) return CP.N
                break

            case CP.SE:
                if (this.unit.offsetLeft + this.width === this.level.width) return CP.S
                if (this.unit.offsetTop + this.height === this.level.height) return CP.E
                break
        }
        return direction
    }

    startChasing = target => {
        this.chasingLatency = 0
        if (this.chasingTarget) return
        this.level.chasers.push(this)
        this.chasingTarget = target
        this.chasingStartSec = this.level.timeSec
        removeClassByMask(this.unit, 'move_')
    }

    stopChasing = () => {
        if (this.level.chasers)
            this.level.chasers = this.level.chasers.filter(obj => obj !== this)
        this.chasingTarget = undefined
        this.aimCoord = undefined
        this.chasingStartSec = 0
        this.unit.style.transform = ''
    }

    chase = async target => {
        if (target.isDead)
            return this.stopChasing()

        let aimCoord
        if (!this.aimCoord || (this.chasingLatency += 1) > 2) {
            this.aimCoord = getCenterCoordinates(target)
            this.chasingLatency = 0
        }
        aimCoord = this.aimCoord

        const chaserCoord = {
                x: this.unit.offsetLeft + this.width / 2,
                y: this.unit.offsetTop + this.height / 2
            },
            vector = {x: aimCoord.x - chaserCoord.x, y: aimCoord.y - chaserCoord.y},
            vectorLength = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))

        if (vectorLength <= target.width / 1.5)
            return

        let angle = Math.atan2(aimCoord.y - chaserCoord.y, aimCoord.x - chaserCoord.x) * (180 / Math.PI)
        this.unit.style.transform = `rotate(${angle + 90}deg)`

        const pointVal = (coord, dim) => Math.round(
            vector[coord] / vectorLength * this.speed * 1.2 + chaserCoord[coord]) - this.unit[`offset${dim}`] / 2

        Object.assign(this.unit.style,
            {left: `${pointVal('x', 'Width')}px`, top: `${pointVal('y', 'Height')}px`})
    }
}