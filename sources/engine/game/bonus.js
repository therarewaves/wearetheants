import {element, insert} from '../../ui/elements.js'
import {getRandomInt} from '../misc.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'
import {defineLocationSector} from '../physics/cpmovement.js'


const iconPath = '/static/images/bonuses/',
    iconSize = 24 // width/height, px

export const bonus = (...args) =>
    new Bonus(...args)

class Bonus {
    static lifetimeSec = 10

    static bonus = class _bonus {
        constructor(unit, type, effect, score, appearedSec) {
            this.unit = unit
            this.width = iconSize
            this.height = iconSize
            this.type = type
            this.effect = effect
            this.score = score
            this.appearedSec = appearedSec
            this.lifetimeSec = Bonus.lifetimeSec
            defineLocationSector(this)
        }

        activateEffect = player => {
            if (this?.score > 0) {
                player.score += this.score
                player.level.game.ui.gameInterface.updateScore(player.score)
            }

            this.effect(player)
            this.remove(player.level, this.unit)
        }

        remove = level => {
            level.activeBonuses = level.activeBonuses.filter(obj => obj !== this)
            this.unit.remove()
        }
    }

    constructor(name, icon, score, effect, extClassList = undefined) {
        this.name = name
        this.icon = icon
        this.score = score
        this.type = 'bonus'
        this.effect = effect
        this.extClassList = extClassList
    }

    spawn = async level => {
        const unit = this.drawObject(
            level.unit,
            getRandomInt(1, level.arena.width - iconSize),
            getRandomInt(1, level.arena.height - iconSize)
        )

        unit.width = unit.offsetWidth
        unit.height = unit.offsetHeight
        const bonus = new Bonus.bonus(unit, this.type, this.effect, this.score, level.timeSec)
        level.activeBonuses.push(bonus)
    }

    drawObject = (container, posX, posY) => {
        let classList = ['level_object', 'level_bonus']
        this.extClassList && (classList.push(...this.extClassList))

        const wrapper = element('img', classList)
        wrapper.src = loadDataFromLocalStorage(`${iconPath}${this.icon}`)
        Object.assign(wrapper.style, {left: `${posX}px`, top: `${posY}px`})
        return insert(container, wrapper)
    }
}