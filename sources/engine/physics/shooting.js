import {element, insert, isElementsOverlap} from '../../ui/elements.js'
import {getCenterCoordinates} from '../misc.js'
import {defineLocationSector} from './cpmovement.js'


export const shoot = (shooter, aimCoord) =>
    new Bullet(shooter, aimCoord)

export class Bullet {
    constructor(shooter, aimCoord) {
        this.offset = 0
        this.shooter = shooter
        this.type = 'bullet'
        this.arenaWidth = shooter.level.arena.width
        this.arenaHeight = shooter.level.arena.height

        const shooterCoord = getCenterCoordinates(shooter)
        this.spawn(shooter.level.unit, shooterCoord)
        defineLocationSector(this)

        const
            vector = {x: aimCoord.x - shooterCoord.x, y: aimCoord.y - shooterCoord.y},
            vectorLength = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)),
            cacheX1 = (aimCoord.x - shooterCoord.x) / vectorLength,
            cacheX2 = (aimCoord.y - shooterCoord.y) / vectorLength

        this.pathPoint = offset => ({
            'x': shooterCoord.x + offset * cacheX1,
            'y': shooterCoord.y + offset * cacheX2
        })

        shooter.level.bullets.push(this)
    }

    spawn = (container, coord) => {
        const unit = element('div', ['bullet'])
        Object.assign(unit.style, {left: `${coord.x}px`, top: `${coord.y}px`})
        this.unit = insert(container, unit)
        this.width = this.unit.offsetWidth
        this.height = this.unit.offsetHeight
    }

    move = () => {
        const newCoordinates = this.pathPoint(this.offset += this.shooter.bulletSpeed)
        Object.assign(this.unit.style, {left: `${newCoordinates.x}px`, top: `${newCoordinates.y}px`})
        defineLocationSector(this)

        if (newCoordinates.x < 0 || newCoordinates.y < 0 ||
            newCoordinates.x > this.arenaWidth || newCoordinates.y > this.arenaHeight) {
            this.destruct()
            return
        }

        this.shooter.level.npc.forEach(npc => {
            if (isElementsOverlap(npc, this)) {
                this.destruct()
                npc.takeDamage(this.shooter)
            }
        })
    }

    destruct = () => {
        this.unit.remove()
        this.shooter.level.bullets =
            this.shooter.level.bullets.filter(obj => obj !== this)
    }
}