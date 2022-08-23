import {capitalizeFirstLetter, getRandomInt, getRandomObjectFromList} from '../misc.js'
import {CPR, CP, defineLocationSector, CpMovement} from '../physics/cpmovement.js'
import {element, insert, isElementsOverlap} from '../../ui/elements.js'
import {log} from '../logging.js'


export class Ant extends CpMovement {
    static pk = 0

    static specs = {
        damage: 1,
        height: 10,
        width: 4,
        health: 10,
    }

    score = 1
    speed = 10  // in pixels
    moveRating = 1000  // the higher, the better; 0 = freezing, 1000 = maximum
    chasingSec = 20

    static getSubclass = type =>
        ({queen: QueenAnt, warrior: WarriorAnt, worker: WorkerAnt}[type])

    constructor(colony, type, name, gender = 'male') {
        super()

        if (new.target === Ant) {
            throw new TypeError('Cannot construct Abstract instances directly')
        }

        this.id = ++Ant.pk
        this.direction = undefined
        this.unit = undefined
        this.colony = colony
        this.level = colony.level
        this.type = type
        this.name = name ? name : getRandomAntName(gender)

        Object.keys(Ant.specs).forEach(spec => this[spec] = Ant.specs[spec])
    }

    scaleToType() {
        const scale = spec => {
            const ratio = (Ant.getSubclass(this.type)).ratio
            return Ant.specs[spec] * (ratio ? ratio[spec] : 1)
        }

        Object.keys(Ant.specs).forEach(spec => this[spec] = scale(spec))
    }

    spawn = () => {
        const locateUnit = unit =>
            Object.assign(unit.style, {
                left: `${getRandomInt(1, this.level.arena.width - this.width)}px`,
                top: `${getRandomInt(1, this.level.arena.height - this.height)}px`
            })

        const unit = element('div', ['ant', `ant__${this.type}`])
        unit.style.width = `${this.width}px`
        unit.style.height = `${this.height}px`
        locateUnit(unit)
        insert(this.level.unit, unit)

        this.unit = unit
        this.width = this.unit.offsetWidth
        this.height = this.unit.offsetHeight
        defineLocationSector(this)
        return unit
    }

    move = () => {
        if (this.chasingTarget) {
            this.unit.classList.remove(`ant__${this['type']}_frozen`)
            void this.chase(this.chasingTarget)
        } else
            this.wander()

        defineLocationSector(this)
        if (isElementsOverlap(this, this.level.game.player))
            void this.level.game.player.takeDamage(this)
    }

    wander = () => {
        // roll the dice: don't move
        if (this.isFrozen) {
            (95 <= getRandomInt(1, 100)) && (this.isFrozen = false)
            return false
        } else if (this.moveRating <= getRandomInt(1, 1000)) {
            this.unit.classList.add(`ant__${this.type}_frozen`)
            this.isFrozen = true
            return false
        }

        // roll the dice: re-roll the direction
        if (!this.direction || getRandomInt(1, 30) === 1)
            this.direction = getRandomInt(1, Object.keys(CP).length)

        this.changeMoveSprite(this.direction)
        this.go(this.direction)
    }

    changeMoveSprite = direction =>
        this.unit.classList = `ant ant__${this.type} move_${CPR[this.correctMovingDirection(direction)]}`

    async takeDamage(cause) {
        this.health -= cause.damage ? cause.damage : 1
        this.health <= 0 && this.die(cause)
        if (cause.type === 'player') {
            cause.shotsInTargets += 1
            cause.updateStatus('accuracy')
        }
    }

    die = killer => {
        if (killer) {
            killer.kills += 1

            if (killer.type === 'player') {
                killer.updateStatus('kills')
                killer.score += this.score
                this.level.game.ui.gameInterface.updateScore(killer.score)
            }
        }

        if (this.type === 'queen')
            log(this.level.game, 'God bless the queen!')

        this.unit.remove()

        if (this.colony[this.type])
            this.colony[this.type] = this.colony[this.type].filter(obj => obj !== this)

        const colonyInfo = this.level.game.ui.gameInterface.gameInfo
            .querySelector(`.colony__info[data-colony-id='${this.colony.id}'] .colony__param[data-type='${this.type}']`)
        if (colonyInfo)
            colonyInfo.innerText = `${capitalizeFirstLetter(this.type)}s: ${this.colony[this.type].length}`

        if (this.level.npc)
            this.level.npc = this.level.npc.filter(obj => obj !== this)
    }
}

export class QueenAnt extends Ant {
    static ratio = {
        damage: 15,
        height: 6,
        width: 6,
        health: 10,
    }

    speed = 1
    moveRating = 550
    score = 50

    constructor(colony) {
        super(colony, 'queen', undefined, 'female')
        this.scaleToType()
    }

    takeDamage = async cause => {
        await Ant.prototype.takeDamage.call(this, cause)

        this.colony.warrior.forEach(warrior =>
            getRandomInt(1, 3) === 1 && warrior.startChasing(cause))
    }
}

export class WarriorAnt extends Ant {
    static ratio = {
        damage: 2,
        height: 2,
        width: 2,
        health: 3,
    }

    static speed = 3
    moveRating = 990
    score = 10

    constructor(colony) {
        super(colony, 'warrior')
        this.scaleToType()
        this.speed = getRandomInt(2, WarriorAnt.speed)
    }

    takeDamage = async cause => {
        await Ant.prototype.takeDamage.call(this, cause)
        this.startChasing(cause)
    }
}

export class WorkerAnt extends Ant {
    static speed = 4
    score = 1

    constructor(colony) {
        super(colony, 'worker')
        this.scaleToType()
        this.speed = getRandomInt(1, WorkerAnt.speed)
    }
}

const antNames = {
    maleFirstNames: [
        'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Thomas', 'Oscar', 'William',
        'James', 'Bart', 'Griffith', 'Jones', 'Tobiah', 'Wilbert', 'Blake', 'Bobby', 'Caleb', 'Carter', 'Charles',
        'Daniel', 'David', 'Dexter', 'Dylan', 'Edward', 'Elijah', 'Elliot', 'Elliott', 'Ellis', 'Ethan', 'Ezra',
        'Felix', 'Finley', 'Frankie', 'Freddie', 'Frederick', 'Gabriel', 'Harley', 'Harrison', 'Harvey'
    ],
    femaleFirstNames: [
        'Amelia', 'Olivia', 'Emily', 'Jessica', 'Ava', 'Ella', 'Isabella', 'Poppy', 'Sophia'
    ],
    lastNames: [
        'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Evans',
        'King', 'Thomas', 'Baker', 'Green', 'Wright', 'Johnson', 'Edwards', 'Clark', 'Roberts', 'Robinson'
    ]
}

const getRandomAntName = gender => {
    const first_names = gender === 'male' ? antNames.femaleFirstNames : antNames.femaleFirstNames
    const capFirst = str => str.charAt(0).toUpperCase() + str.slice(1)
    return `${capFirst(getRandomObjectFromList(first_names))} ${capFirst(getRandomObjectFromList(antNames.lastNames))}`
}