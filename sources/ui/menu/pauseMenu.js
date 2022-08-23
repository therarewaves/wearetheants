import {element, insert} from '../elements.js'
import {goBackToMainMenu} from './mainMenu.js'


export const pauseMenu = (game, ui) => {
    const pauseMenu = element('div', ['pause_menu', 'navigation_menu'])

    const continueGameLink = insert(pauseMenu,
            element('div', ['menu__item', 'main_menu__item', 'menu__item_selected'], 'Continue game')),
        goBackToMenuLink = insert(pauseMenu, element('div', ['menu__item', 'main_menu__item'], 'Go back to menu'))

    continueGameLink.addEventListener('click', () =>
        game.stateManager.runPause(game.currentLevel))

    goBackToMenuLink.addEventListener('click', () => {
        game.stop()
        game.isCanceled = true
        goBackToMainMenu(game)
    })

    const wrapper = element('div', ['menu_wrapper'])
    insert(wrapper, pauseMenu)
    return insert(ui.gameInterface.playingField, wrapper)
}