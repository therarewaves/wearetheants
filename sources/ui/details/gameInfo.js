import {controlButton, element, insert} from '../elements.js'
import {convertSecondsToTime} from '../../engine/logging.js'
import {musicController} from '../../engine/sound/music.js'


export const gameInfo = (game, container) => {
    const wrapper = element('div', ['game__info'])

    game.soundControls = soundControls(game, wrapper)
    game.timerBoard = gameTimer(game, wrapper)
    game.puzzleBoard = puzzleInfo(game, wrapper)
    game.scoreBoard = score(game, wrapper)
    game.levelInfo = currentLevelInfo(game, wrapper)

    return insert(container, wrapper)
}

const soundControls = (game, container) => {
    const controls = element('div', ['game__info__block_buttons']),
        play = controlButton('play', 'Play/Pause'),
        stop = controlButton('stop', 'Stop'),
        playPrevious = controlButton('playPrevious', 'Play Previous'),
        playNext = controlButton('playNext', 'Play Next')

    const volumeControlGroup = element('div', ['volume_control_group'])

    const mc = musicController(volumeControlGroup, game, play)
    game.musicController = mc

    play.addEventListener('click', () => mc.playPause())
    stop.addEventListener('click', () => mc.stop())
    playPrevious.addEventListener('click', () => mc.playPrevious())
    playNext.addEventListener('click', () => mc.playNext())

    ;[playPrevious, play, stop, playNext, volumeControlGroup].forEach(element =>
        insert(controls, element)
    )

    return gameInfoBlock(container, 'Radio', [controls])
}

const gameTimer = (game, container) => {
    game.time = element('div', ['game__time'], convertSecondsToTime(0))
    gameInfoBlock(container, 'Game time', [game.time])
    return game.time
}

const puzzleInfo = (game, container) => {
    const wrapper = element('div', ['game__puzzle'])
    gameInfoBlock(container, 'PUZZLE', [wrapper])
    return wrapper
}

const score = (game, container) => {
    const wrapper = element('div', ['game__score'], '0')
    gameInfoBlock(container, 'Score', [wrapper])
    return wrapper
}

const currentLevelInfo = (game, container) => {
    const wrapper = gameInfoBlock(container, 'Level info', [])
    game.currentLevelName = wrapper.querySelector('.game__info__block_label')
    return wrapper
}

const gameInfoBlock = (menu, label = '', elements = []) => {
    elements.unshift(element('div', ['game__info__block_label'], label.toUpperCase()))
    const block = element('div', ['game__info__block'], '')
    elements.forEach(element => insert(block, element))
    return insert(menu, block)
}