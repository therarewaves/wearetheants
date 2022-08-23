import {element, insert} from '../elements.js'
import {chars} from '../../game/characters.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'


export const charMenu = (game) => {
    const charMenu = element('div', ['char_menu', 'navigation_menu']),
        charList = insert(charMenu, element('div', ['char_list']))

    const chooseCharacter = (e, game) => {
        const selectedChar = chars[e.target.closest('.char_container').dataset.charIndex]
        game.ui.menu.hideMenus()
        game.start(selectedChar)
    }

    chars.forEach((char, charIndex) => {
        const charContainer = insert(charList, element('div', ['menu__item', 'char_container']))
        ;['image', 'name', 'attrs_info', 'desc'].forEach(attr =>
            insert(charContainer, element('div', [`char_container__${attr}`], char[attr])))
        charContainer.dataset.charIndex = charIndex.toString()

        const imageContainer = charContainer.querySelector('.char_container__image')
        imageContainer.textContent = ''
        const img = insert(imageContainer, element('img', ['char_image']))
        img.src = loadDataFromLocalStorage(`${char.images}/preview.png`)

        charContainer.addEventListener('click', e => chooseCharacter(e, game))
    })

    charList.children[1].classList.add('menu__item_selected')

    const wrapper = element('div', ['menu_wrapper'])
    insert(wrapper, charMenu)
    return insert(game.menu, wrapper)
}

