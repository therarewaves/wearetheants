import {CP, CpMovement, defineLocationSector} from '../physics/cpmovement.js'
import {element, insert} from '../../ui/elements.js'
import {getRandomObjectFromList, sleep} from '../misc.js'
import {shoot} from '../physics/shooting.js'
import {
    actionBinds,
    getComplexDirection,
    getKeyMap,
    isPressedButtonsConflictsExist,
    MBR,
    mouseKeyMap,
    moveBinds
} from './controls.js'
import {log} from '../logging.js'
import {getAbsoluteOffset, mouseX, mouseY, moveScreen} from '../physics/screen.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'
import {drawPuzzleHints} from '../game/puzzle.js'


export const player = (game, character) => new Player(game, character)

export class Player extends CpMovement {
    static specs = {
        bulletSpeed: 10,
        ERC: 50,  // energy restoring countdown (frames)
        height: 48,
        width: 48,
        maxEnergy: 100,
        maxHealth: 100,
    }

    constructor(game, character) {
        super()
        this.game = game
        this.name = character.name
        this.kills = 0
        this.score = 0
        this.shots = 0
        this.shotsInTargets = 0
        this.type = 'player'
        this.character = character
        this.bulletSpeed = Player.bulletSpeed
        this.drawPlayer()
        this.resetKeyMaps()
    }

    drawPlayer = () => {
        const playerSize = {width: `${this.character.attrs.width}px`, height: `${this.character.attrs.height}px`}
        this.unit = element('div', ['player'])
        this.body = element('div', ['player_body'])
        this.head = element('div', ['player_head'])
        ;[this.unit, this.head, this.body].forEach(part => Object.assign(part.style, playerSize))
        insert(this.unit, this.head)
        insert(this.unit, this.body)
        this.loadSprite('body', 'body.png')
        this.loadSprite('head', 'head.png')
    }

    loadSprite = (part, filename) =>
        this[part].style.backgroundImage =
            filename ? `url(${loadDataFromLocalStorage(`${this.character.images}/${filename}`)})` : 'none'

    resetKeyMaps = () => {
        this.movementKeyMap = getKeyMap(moveBinds)
        this.actionKeyMap = getKeyMap(actionBinds)
        mouseKeyMap.left = false
        mouseKeyMap.right = false
    }

    spawn = level => {
        this.level = level
        this.locate(level.arena.width / 2 - Player.specs.width / 2,
            level.arena.height / 2 - Player.specs.height / 2)
        this.speed = this.character.attrs.speed
        this.health = this.character.attrs.hp
        this.energy = Player.specs.maxEnergy
        this.damage = this.character.attrs.damage
        this.ERC = Player.specs.ERC
        this.isIgnoreDamage = false
        this.isDead = false
        this.direction = CP.N

        Object.keys(Player.specs).forEach(
            spec => this[spec] = Player.specs[spec]
        )

        ;['health', 'energy', 'kills', 'accuracy', 'characterInfo'].forEach(status =>
            this.updateStatus(status))

        insert(level.unit, this.unit)
        this.width = this.unit.offsetWidth
        this.height = this.unit.offsetHeight

        log(this.game, `${this.name}: ${getRandomObjectFromList(playersEntryPhrases)}`)
        this.resetKeyMaps()
        defineLocationSector(this)
    }

    locate = (left, top) =>
        Object.assign(this.unit.style, {left: `${left}px`, top: `${top}px`})

    updateStatus = attribute => {
        this.game.ui.gameInterface.playerInfo.updateStatus(attribute)
        switch (attribute) {
            case 'health':
                this.level.game.ui.gameInterface.updateLifebar(this)
                break
        }
    }

    takeDamage = async cause => {
        if (this.isDead || this.isIgnoreDamage) return

        this.health -= cause.damage ? cause.damage : 1
        this.updateStatus('health')

        if (this.health <= 0)
            return this.die()

        this.level.container.classList.add('player__takes_damage')
        await sleep(400)
        this.level.container.classList.remove('player__takes_damage')
    }

    die = () => {
        if (this.isDead) return
        this.level.removeAllPuzzleHints(this.level)
        this.isDead = true
        this.unit.classList = 'player player__dead'
        this.loadSprite('head')
        this.loadSprite('body')
        this.updateStatus('health')
        this.updateStatus('energy')
        this.game.ui.gameInterface.playerIsDeadTrigger(this.game.currentLevel)
        log(this.game, `${this.name}: This is the Way...`)
    }

    shoot = async () => {
        if (this.isDead) return

        const rect = this.level.unit.getBoundingClientRect()
        const cursorCenterCorrection = 7
        shoot(this.game.player,
            {
                'x': mouseX - rect.left + cursorCenterCorrection,
                'y': mouseY - rect.top + cursorCenterCorrection
            })
        this.shots += 1
        this.updateStatus('accuracy')
    }

    useAbility = async () => {
        if (this.isDead || this.game.isPaused()) return

        this.resetERC()
        if (this.character.ability) {
            this.character.ability(this)
            this.updateStatus('energy')
        }
    }

    resetERC = delay =>
        this.ERC = delay || Player.specs.ERC

    move = async () => {
        if (this.isMoving || this.isDead || this.currentLevel.state !== this.game.stateManager.states.run ||
            this.currentLevel.isComplete) return

        this.isMoving = true

        const minSpeedDelay = 20,
            accelerationDecrement = 10
        let speedDelay = 100

        let prevKeyMap = '', direction

        while (this.isMoving) {
            if (isPressedButtonsConflictsExist(this.movementKeyMap)) continue

            const currentKeyMap = Object.values(this.movementKeyMap).reduce((result, x) => `${result}${x ? 1 : 0}`, '')
            speedDelay > minSpeedDelay && (speedDelay -= accelerationDecrement)
            await sleep(speedDelay)

            if (currentKeyMap !== prevKeyMap) {
                prevKeyMap = currentKeyMap
                const pressedKeys = Object.keys(Object.fromEntries(
                    Object.entries(this.movementKeyMap).filter(([_, isPressed]) => isPressed)
                ))

                direction =
                    pressedKeys.length === 1 ?
                        MBR[pressedKeys] :
                        getComplexDirection(pressedKeys)

                if (direction !== this.direction)
                    this.changeMoveSprite(direction)

                if (pressedKeys.length === 0 || this.isDead)
                    return this.isMoving = false
            }

            if (!this.isDead && !this.currentLevel.isComplete && direction) {
                this.direction = direction
                this.go(direction)
                defineLocationSector(this)
                moveScreen(this)
            }

            // puzzle radar
            drawPuzzleHints(this.level)
        }
    }

    turnTowardsCursor = () => {
        if (this.isDead)
            return

        const offset = getAbsoluteOffset(this.unit),
            [posX, posY] = [offset.x + this.width / 2, offset.y + this.height / 2]

        if (Math.abs(posX - mouseX) < 10 && Math.abs(posY - mouseY) < 10)
            return

        let angle = Math.atan2(mouseY - posY, mouseX - posX) * (180 / Math.PI)
        this.game.documentRoot.style.setProperty('--player-rotation', `rotate(${angle + 90}deg)`)
    }
}

export class PlayerCharacter {
    constructor(name, desc, attrs, attrs_info, images, ability, other) {
        this.name = name
        this.desc = desc
        this.attrs = attrs
        this.attrs_info = attrs_info
        this.images = images
        this.ability = ability
        this.other = other
    }
}

const playersEntryPhrases = [
    'I can bring you in warm, or I can bring you in cold.',
    'Bounty hunting is a complicated profession.',
    'Weapons are part of my religion.',
    'Would anyone care for some tea?',
    'We are a clan of two.',
]