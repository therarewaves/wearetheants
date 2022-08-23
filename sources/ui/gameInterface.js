import {element, hide, insert, show} from './elements.js'
import {gameInfo} from './details/gameInfo.js'
import {playerControls} from './details/playerControls.js'
import {endGameMenu} from './menu/endGameMenu.js'
import {playerInfo} from './details/playerInfo.js'
import {convertSecondsToTime} from '../engine/logging.js'
import {mouseLeftButtonIndex, mouseRightButtonIndex} from '../engine/player/controls.js'


export const gameInterface = game => new GameInterface(game)

class GameInterface {
    constructor(game) {
        this.game = game
        this.mainFrame = element('div', ['main_container__mf'])
        this.addFrame = element('div', ['main_container__af'])

        this.lifebar = lifebar(this.mainFrame)
        this.playingField = insert(this.mainFrame, element('div', ['playing_field']))
        this.gameInfo = gameInfo(game, this.addFrame)
        this.playerControls = playerControls(game, this.mainFrame)
        this.playerInfo = playerInfo(this.playerControls)

        this.playingField.addEventListener('mousedown', e => {
            if (this.game.player.isDead) return

            switch (e.button) {
                case mouseLeftButtonIndex:
                    void this.game.player.shoot(e)
                    break
                case mouseRightButtonIndex:
                    void this.game.player.useAbility()
                    break
            }
        })

        insert(game.container, this.mainFrame)
        insert(game.container, this.addFrame)
        this.hide()
    }

    hide = () => {
        hide(this.mainFrame)
        hide(this.addFrame)
    }

    show = () => {
        show(this.mainFrame, 'flex')
        show(this.addFrame)
    }

    playerIsDeadTrigger = level => {
        level.unit.classList.add('grayscale_blur')
        level?.activeBonuses && level.activeBonuses.forEach(activeBonus => activeBonus.remove(level))
        void endGameMenu(level.game.ui.gameInterface.playingField, level.game)
    }

    updateTimer = level =>
        this.game.timerBoard.innerText = convertSecondsToTime(level.timeSec)

    updateScore = score =>
        this.game.scoreBoard.innerText = score

    updateLifebar = player => {
        const hp = (player.health / (player.character.attrs.hp / 100)) * (this.lifebar.parentElement.offsetWidth / 100)
        this.lifebar.style.width = `${hp <= 0 ? 0 : hp - 2}px`
        this.lifebar.parentElement.querySelector('.hp_lifebar__player_name').textContent =
            `${player.name}: ${player.health > 0 ? `${player.health}/${player.character.attrs.hp} hp` : `dead`}`
    }
}

const lifebar = parentContainer => {
    const container = element('div', ['hp_container']),
        hpLifeBar = element('div', ['hp_lifebar'])

    insert(container, hpLifeBar)
    insert(hpLifeBar, element('span', ['hp_lifebar__player_name']))
    insert(parentContainer, container)
    return hpLifeBar
}