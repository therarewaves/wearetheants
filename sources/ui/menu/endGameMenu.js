import {broadcast} from '../broadcast.js'
import {goBackToMainMenu} from './mainMenu.js'
import {element, insert} from '../elements.js'


export const endGameMenu = async (container, game) => {
    const bc = await broadcast(container, true)
    bc.channel.classList.add('endgame')

    const keyboardNav = e => {
        const selected = container.querySelector('.text__play_again__selected')
        let nextSelection

        switch (e.code) {
            case 'Enter':
            case 'NumpadEnter':
            case 'Escape':
                interaction(selected.dataset.value === 'true' && (['Enter', 'NumpadEnter'].includes(e.code)))
                break
            case 'KeyA':
            case 'ArrowLeft':
                nextSelection = selected.previousElementSibling
                break
            case 'KeyD':
            case 'ArrowRight':
                nextSelection = selected.nextElementSibling
                break
            default:
                return
        }

        if (!nextSelection) return
        nextSelection.classList.add('text__play_again__selected')
        selected.classList.remove('text__play_again__selected')
    }

    const mouseNavHover = e => {
        if (e.target.classList.contains('text__play_again__option')) {
            container.querySelector('.text__play_again__selected').classList.remove('text__play_again__selected')
            e.target.classList.add('text__play_again__selected')
        }
    }

    const mouseNavClick = e =>
        e.target.classList.contains('text__play_again__option')
        && interaction(e.target.dataset.value === 'true')

    document.addEventListener('keydown', keyboardNav)
    container.addEventListener('mouseover', mouseNavHover)
    container.addEventListener('click', mouseNavClick)

    const interaction = isPlayAgain => {
        document.removeEventListener('keydown', keyboardNav)
        container.removeEventListener('mouseover', mouseNavHover)
        container.removeEventListener('click', mouseNavClick)
        bc.close()

        const endgame__win_bg = document.querySelector('.endgame__win_bg')
        endgame__win_bg && endgame__win_bg.remove()

        if (isPlayAgain)
            game.reset()
        else {
            game.stop()
            goBackToMainMenu(game)
        }
    }

    const resultPhrase = game?.player?.isDead ?
        `Game o<span class="text__raspberry">v</span>er` :
        `Congra<span class="text__raspberry">t</span>ulations!`

    if (!game?.player?.isDead) {
        insert(game.ui.gameInterface.playingField, element('div', ['endgame__win_bg']))
    }

    await bc.say(
        `<div>${resultPhrase}</div>` +
        `<div class="text__total_score">Your score: ${game.player.score}</div>` +
        `<div class="text__play_again">Play again? ` +
        `<span class="text__play_again__option text__play_again__selected" data-value="true">yes</span> ` +
        `<span class="text__play_again__option" data-value="false">no</span></div>`)
}