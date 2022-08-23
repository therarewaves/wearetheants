import {ui} from './ui/ui.js'
import {stateManager} from './engine/game/stateManager.js'
import {briefing, credits} from './game/declarations.js'
import {show} from './ui/elements.js'


export const loadGame = container =>
    new Game(container)

class Game {
    constructor(container) {
        this.options = {
            isMusicOn: false,
        }

        this.documentRoot = document.querySelector(':root')
        this.container = container
        this.currentLevel = undefined
        this.player = undefined
        this.stateManager = stateManager()
        this.ui = ui(this)
        this.ui.menu.showMenu(this.ui.menu.mainMenu)
        show(this.container)
    }

    start = (character, options) =>
        this.stateManager.start(this, character, options)

    stop = () =>
        this.stateManager.stop(this)

    reset = async () => {
        const selectedCharacter = this.player.character
        await this.stop()
        await this.start(selectedCharacter, {isSkipIntro: true})
    }

    isPaused = () =>
        this.stateManager.isState(this.currentLevel, 'pause')

    briefing = () =>
        briefing(this.container, this)

    credits = () =>
        credits(this.container, this)
}

