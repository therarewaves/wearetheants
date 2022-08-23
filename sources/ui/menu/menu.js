import {element, hide, insert, show} from '../elements.js'
import {mainMenu} from './mainMenu.js'
import {charMenu} from './charMenu.js'
import {pauseMenu} from './pauseMenu.js'


export const menu = (game, ui) =>
    new Menu(game, ui)

class Menu {
    constructor(game, ui) {
        this.game = game
        game.menu = insert(game.container, element('div', ['menu']))

        this.mainMenu = mainMenu(game)
        this.charMenu = charMenu(game)
        this.pauseMenu = pauseMenu(game, ui)

        document.addEventListener('keydown', e => this.navigate(e.code))
        game.container.querySelectorAll('.menu__item').forEach(menuItem =>
            menuItem.addEventListener('mouseover', () => {
                menuItem.closest('.menu_wrapper').querySelector('.menu__item_selected')
                    .classList.remove('menu__item_selected')
                menuItem.classList.add('menu__item_selected')
            }))
    }

    showMenu = menu => {
        this.prevMenu = this.currentMenu
        if (this.currentMenu)
            this.hideMenus()
        this.currentMenu = menu

        const isInnerGameMenu = menu.parentElement.classList.contains('playing_field')

        if (!isInnerGameMenu)
            this.game.ui.gameInterface.hide()
        show(menu, 'table')
    }

    hideMenus = () => {
        this.currentMenu = undefined
        hide(this.game.ui.menu.mainMenu)
        hide(this.game.ui.menu.charMenu)
        hide(this.game.ui.menu.pauseMenu)
    }

    navigate = async key => {
        if (!this.currentMenu) return
        const selected = this.currentMenu.querySelector('.menu__item_selected')

        if (['Enter', 'NumpadEnter', 'Space'].includes(key)) {
            selected.click()
            return
        }

        let nextSelection
        switch (key) {
            case 'Escape':
                if (this.prevMenu) this.showMenu(this.prevMenu)
                break
            case 'KeyW':
            case 'KeyA':
            case 'ArrowUp':
            case 'ArrowLeft':
                nextSelection = selected.previousSibling
                break
            case 'KeyS':
            case 'KeyD':
            case 'ArrowDown':
            case 'ArrowRight':
                nextSelection = selected.nextSibling
                break
            default:
                return
        }

        if (!nextSelection) return

        nextSelection.classList.add('menu__item_selected')
        selected.classList.remove('menu__item_selected')
    }
}