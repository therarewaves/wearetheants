import {gameInterface} from './gameInterface.js'
import {menu} from './menu/menu.js'


export const ui = game => new Ui(game)

class Ui {
    constructor(game) {
        this.gameInterface = gameInterface(game)
        this.menu = menu(game, this)

        game.container.addEventListener('contextmenu', e => e.preventDefault())
    }
}