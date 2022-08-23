import {frameLength, levelLoop} from './levelLoop.js'
import {levels} from '../../game/levels.js'
import {gameIntro, gameOutro, levelIntro} from '../../game/declarations.js'
import {endGameMenu} from '../../ui/menu/endGameMenu.js'
import {player} from '../player/player.js'
import {sleep} from '../misc.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'
import {energyShield} from '../player/abilities.js'


export const stateManager = () =>
    new StateManager()

class StateManager {
    constructor() {
        this.states = {stop: 0, run: 1, pause: 2}
    }

    start = async (game, character, options) => {
        game.levels = levels(game)
        game.isCanceled = false

        game.player = player(game, character)
        game.ui.gameInterface.playerInfo.init(game.player)
        if (game.options?.isMusicOn)
            game.musicController.playNext()

        if (!options?.isSkipIntro)
            await gameIntro(game.container)
        game.ui.gameInterface.show()

        for (const level of game.levels) {
            game.currentLevel = level
            game.player.currentLevel = level
            this.setState(level, 'stop')

            level.init()
            await levelIntro(game.container, level)
            game.player.spawn(level)
            level.spawnNpc()
            energyShield(game.player, true)

            await this.runPause(level)
            if (!game.player || game.player.isDead || game.isCanceled) break
        }

        if (game?.currentLevel?.state === 0)
            return

        if (!this.isState(game.currentLevel, 'stop') && game.player) {
            await gameOutro(game.ui.gameInterface.playingField)
            await endGameMenu(game.ui.gameInterface.playingField, game)
        }
    }

    stop = async game => {
        if (game.currentLevel) {
            this.setState(game.currentLevel, 'stop')
            await sleep(frameLength * 2)
            game.currentLevel.demolish()
            game.currentLevel = undefined
        }
        game.player = undefined
        game.levels = undefined
    }

    runPause = async level => {
        if (this.isState(level, ['run', 'pause'])) {
            this.setState(level, this.isState(level, 'pause') ? 'run' : 'pause')

            ;['queen', 'warrior', 'worker'].forEach(type => {
                level.game.documentRoot.style.setProperty(`--${type}-skin`,
                    `url(${loadDataFromLocalStorage(
                        `/static/images/ants/${type}.${this.isState(level, 'pause') ? 'png' : 'gif'}`)})`)
            })
        } else {
            this.setState(level, 'run')
            await levelLoop(level).then(() =>
                level.demolish()
            )
        }
    }

    setState = (level, state) => {
        if (state === 'pause') {
            level.game.ui.menu.showMenu(level.game.ui.menu.pauseMenu)
        } else if (this.isState(level, 'pause')) {
            level.game.ui.menu.hideMenus()
            level.game.ui.gameInterface.show()
        }

        level.state = this.states[state]
    }

    isState = (level, state) =>
        !level ? false :
            Array.isArray(state) ?
                state.filter(value => this.isState(level, value)).length > 0 :
                level.state === this.states[state]
}