import {element, insert} from '../elements.js'


export const mainMenu = (game) => {
    const mainMenu = element('div', ['main_menu', 'navigation_menu'])
    insert(mainMenu, element('div', ['main_menu__logo']))

    const menuItemClasses = ['menu__item', 'main_menu__item'],
        newGameMI = insert(mainMenu, element('div', menuItemClasses.concat(['menu__item_selected']), 'Start new game')),
        briefingMI = insert(mainMenu, element('div', menuItemClasses, 'Briefing')),
        creditsMI = insert(mainMenu, element('div', menuItemClasses, 'Credits'))

    newGameMI.addEventListener('click', () =>
        game.ui.menu.showMenu(game.ui.menu.charMenu))

    briefingMI.addEventListener('click', () => {
        game.ui.menu.hideMenus()
        void game.briefing()
    })

    creditsMI.addEventListener('click', () => {
        game.ui.menu.hideMenus()
        void game.credits()
    })

    const wrapper = element('div', ['menu_wrapper'])
    insert(wrapper, mainMenu)
    return insert(game.menu, wrapper)
}

export const goBackToMainMenu = game =>
    game.ui.menu.showMenu(game.ui.menu.mainMenu)