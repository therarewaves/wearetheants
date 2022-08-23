import {element, insert} from '../../ui/elements.js'
import {antColony} from '../npc/antColony.js'
import {getRandomObjectFromList} from '../misc.js'
import {Puzzle} from './puzzle.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'


export const level = (...args) =>
    new Level(...args)

class Level {
    constructor(game, code, name, victoryConditions, arenaSettings, bonuses) {
        this.game = game
        this.code = code
        this.name = name

        this.intro = name
        this.victoryConditions = victoryConditions
        this.arena = arenaSettings
        this.bonuses = bonuses
        this.npc = []
        this.bullets = []
    }

    init = () => {
        this.container = this.game.ui.gameInterface.playingField
        this.unit = levelUnit(this.container, this)
        const screenSize = this.unit.parentElement.getBoundingClientRect()
        this.screenWidth = screenSize.width
        this.screenHeight = screenSize.height

        !this.arena.width && (this.arena.width = this.screenWidth)
        !this.arena.height && (this.arena.height = this.screenHeight)

        this.unit.style.width = `${this.arena.width}px`
        this.unit.style.height = `${this.arena.height}px`
        Object.assign(this.unit.style, {
            left: `-${(this.arena.width - this.container.offsetWidth) / 2}px`,
            top: `-${(this.arena.height - this.container.offsetHeight) / 2}px`
        })

        this.arena.background && (this.unit.style.background =
            `url(${loadDataFromLocalStorage(`${this.arena.background}`)})`)
        this.width = this.unit.offsetWidth
        this.height = this.unit.offsetHeight

        this.drawPuzzleHintsContainer()

        this.activeBonuses = []
        this.chasers = []
        this.timeSec = 0
        this.puzzle = new Puzzle(this.game)
        this.game.currentLevelName.innerText = this.name
    }

    spawnRandomBonus = () => {
        const bonusLimit = 5
        if (!this.bonuses || this.activeBonuses.length >= bonusLimit) return
        const bonus = getRandomObjectFromList(this.bonuses)
        bonus.spawn(this)
    }

    spawnNpc = () => {
        if (this.arena.antColonies) {
            let colonies = this.game.levelInfo.querySelector('.colony__info_wrapper')
            if (!colonies)
                colonies = element('div', ['colony__info_wrapper'])
            else
                colonies.innerHTML = ''

            this.arena.antColonies.forEach(colonySettings => {
                const newColony = antColony(this, colonySettings)
                insert(colonies, newColony.getColonyInfo())
            })
            insert(this.game.levelInfo, colonies)
        }
    }

    demolish = () => {
        this.unit.remove()
        if (this.game.levels)
            this.game.levels = this.game.levels.filter(obj => obj !== this)
    }

    drawPuzzleHintsContainer = () => {
        const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        container.setAttribute('width', this.width)
        container.setAttribute('height', this.height)
        container.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
        container.classList.add('puzzle_hints')
        container.style.display = 'block'
        insert(this.unit, container)
        this.puzzleHintsContainer = container
    }

    moveNpc = () => {
        this.npc.forEach(npc => npc.move())
        this.bullets.forEach(bullet => bullet.move())
    }

    removeAllPuzzleHints = () =>
        this.puzzleHintsContainer.remove()

    setTime = sec => {
        this.timeSec !== sec && this.game.ui.gameInterface.updateTimer(this)
        this.timeSec = sec
    }
}

export const arenaSettings = (...args) =>
    new ArenaSettings(...args)

class ArenaSettings {
    constructor(settings = {}) {
        this.width = settings.width
        this.height = settings.height
        this.background = settings.background
        this.playerPosition = settings.playerPosition
        this.antColonies = settings.antColonies
    }
}

const levelUnit = (container, level) => {
    const wrapper = element('div', ['level'])
    wrapper.dataset.code = level.code
    insert(container, wrapper)
    return wrapper
}