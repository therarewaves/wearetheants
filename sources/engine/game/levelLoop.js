import {getRandomInt, sleep} from '../misc.js'
import {actionBinds, mouseKeyMap} from '../player/controls.js'
import {Player} from '../player/player.js'
import {element, insert, isElementsOverlap} from '../../ui/elements.js'
import {drawPuzzleHints, puzzleTimerSec, spawnPuzzle} from './puzzle.js'


const framesPerSecond = 25
export const frameLength = 1000 / framesPerSecond

export const levelLoop = async (level, lifetime = 0) => {
    let puzzleWasSpawnedAtSec = 0
    const textBackgroundContainer = insert(level.container, element('div', ['text__background'])),
        backgroundEndLevelText = '4 8 15 16 23 42 R'
    const player = level.game.player

    for (let frame = 0; lifetime === 0 || frame < lifetime; frame++) {
        while (level.game.isPaused())
            await sleep(frameLength)

        const frameStartingTime = performance.now()

        level.moveNpc()

        const time = Math.round(frame / framesPerSecond)

        // chasers
        if (level.chasers.length) {
            level.chasers.forEach(chaser =>
                (level.timeSec - chaser.chasingStartSec >= chaser.chasingSec) &&
                chaser.stopChasing())
        }

        player.turnTowardsCursor()

        // puzzle
        if (!player.isDead && !level.isComplete && time !== puzzleWasSpawnedAtSec && time % puzzleTimerSec === 0) {
            spawnPuzzle(level)
            drawPuzzleHints(level)
            puzzleWasSpawnedAtSec = time
        }

        !player.isDead && level.setTime(time)
        level.game.stateManager.isState(level, 'stop') && (lifetime = -1)

        // energy restoring
        if (player.energy < Player.specs.maxEnergy && !player.isEnergyShieldActivated)
            if (player.ERC > 0)
                player.ERC -= 1
            else if (!(player.actionKeyMap[actionBinds.actionB] || mouseKeyMap.right)) {
                player.energy += 1
                player.updateStatus('energy')
            }

        // bonuses
        getRandomInt(1, 100) === 1 && level.spawnRandomBonus()

        level?.activeBonuses.forEach(bonus => {
            if (level.timeSec - bonus.appearedSec >= bonus.lifetimeSec)
                bonus.remove(level)

            if (isElementsOverlap(bonus, player))
                bonus.activateEffect(player)
        })

        // level ending
        if ((!level?.npc?.length && level?.victoryConditions?.includes('elimination')) ||
            (level.puzzle.isSolved && level?.victoryConditions?.includes('puzzle'))
        ) {
            lifetime = -1
            level.isComplete = true

            while (textBackgroundContainer.offsetHeight < level.container.offsetHeight) {
                textBackgroundContainer.innerText += `${backgroundEndLevelText} `.repeat(12)
                await sleep(frameLength * 2)
            }

            await sleep(1000)
            textBackgroundContainer.innerText = ''
        }

        const freeTime = frameLength - (performance.now() - frameStartingTime)
        freeTime < 0 && !level.isComplete && console.warn(`Low performance warning. Frame length = ` +
            `${frameLength}ms, free time = ${Math.round(freeTime)}ms`)
        await sleep(freeTime)
    }
}