import {bonus} from './bonus.js'
import {getCenterCoordinates, getRandomObjectFromList} from '../misc.js'
import {log} from '../logging.js'
import {svgPath} from '../../ui/elements.js'


export const puzzleTimerSec = 10
const maxPuzzlesAtaTime = 3

const puzzle = bonus('Puzzle', 'puzzle.png', 25,
    player => {
        log(player.game, 'And here comes another one')
        player.level.puzzle.openRandomLetter(player.game.puzzleBoard)
    },
    ['puzzle_chunk',])

export const spawnPuzzle = level => {
    if (level.unit.querySelectorAll('.puzzle_chunk').length >= maxPuzzlesAtaTime)
        return false
    void puzzle.spawn(level)
}

export class Puzzle {
    constructor(game, word = 'puzzle') {
        this.isSolved = false
        this.word = word
        this.keys = Array.from(Array(this.word.length).keys())
        this.opened = []
        game.puzzleBoard.innerText = this.getWord()
    }

    openRandomLetter = puzzleBoard => {
        if (this.isSolved) return

        const key = getRandomObjectFromList(this.keys)
        this.opened.push(key)
        this.keys.splice(this.keys.indexOf(key), 1)

        if (this.keys.length === 0)
            this.isSolved = true

        puzzleBoard.innerText = this.getWord()
    }

    getWord = () =>
        Array.from(Array(this.word.length).keys()).reduce((result, index) =>
            `${result} ${this.opened.includes(index) ? this.word[index] : '_'} `, '')
            .trim()
            .toUpperCase()
}

export const drawPuzzleHints = level => {
    const puzzleChunks = level.unit.querySelectorAll('.puzzle_chunk')

    level.puzzleHintsContainer.querySelectorAll('path').forEach(path => path.remove())

    if (!puzzleChunks.length) return

    const playerCoord = getCenterCoordinates(level.game.player)

    puzzleChunks.forEach(puzzle => {
        const
            puzzleCoord = getCenterCoordinates({unit: puzzle, width: puzzle.width, height: puzzle.height}),
            vectorCoord = {x: puzzleCoord.x - playerCoord.x, y: puzzleCoord.y - playerCoord.y},
            vectorLength = Math.sqrt(Math.pow(vectorCoord.x, 2) + Math.pow(vectorCoord.y, 2))

        const linePoint = offset => [
            playerCoord.x + offset * (puzzleCoord.x - playerCoord.x) / vectorLength,
            playerCoord.y + offset * (puzzleCoord.y - playerCoord.y) / vectorLength
        ]

        const [xFROM, yFROM] = linePoint(35),
            [xTO, yTO] = linePoint(45)

        const inclinedLineXY = angleRad => [
            -Math.sin(angleRad) * (yFROM - yTO) + Math.cos(angleRad) * (xFROM - xTO) + xTO,
            Math.cos(angleRad) * (yFROM - yTO) + Math.sin(angleRad) * (xFROM - xTO) + yTO
        ]

        const alpha = 45 * 3.14 / 180,
            [xn, yn] = inclinedLineXY(alpha),
            [xn2, yn2] = inclinedLineXY(-alpha)

        const linesColor = 'rgba(22, 97, 117, .9)',
            linesWidth = '2'
        level.puzzleHintsContainer.append(svgPath(`M ${xn} ${[yn]} L ${xTO} ${yTO}`, linesColor, linesWidth))
        level.puzzleHintsContainer.append(svgPath(`M ${xn2} ${[yn2]} L ${xTO} ${yTO}`, linesColor, linesWidth))
    })
}