import {CPR, CP} from '../physics/cpmovement.js'
import {swapDict} from '../misc.js'
import {log} from '../logging.js'


export const moveBinds = {
    [CP.N]: 'KeyW',
    [CP.E]: 'KeyD',
    [CP.S]: 'KeyS',
    [CP.W]: 'KeyA'
}

export const actionBinds = {
    actionA: 'Space',
    actionB: 'ShiftLeft'
}

export const keyCaptions = {
    'KeyW': 'W',
    'KeyA': 'A',
    'KeyS': 'S',
    'KeyD': 'D',
    'Space': 'Space',
    'ShiftLeft': 'Shift'
}

export const mouseLeftButtonIndex = 0,
    mouseRightButtonIndex = 2,
    mouseKeyMap = {left: false, right: false}

document.addEventListener('mousedown', e => {
    switch (e.button) {
        case mouseLeftButtonIndex:
            mouseKeyMap.left = true
            break
        case mouseRightButtonIndex:
            mouseKeyMap.right = true
            break
    }
})

document.addEventListener('mouseup', e => {
    switch (e.button) {
        case mouseLeftButtonIndex:
            mouseKeyMap.left = false
            break
        case mouseRightButtonIndex:
            mouseKeyMap.right = false
            break
    }
})

const
    movementKeys = Object.values(moveBinds),
    actionKeys = Object.values(actionBinds),
    controlKeys = [...movementKeys, ...actionKeys]

export const getKeyMap = binds =>
    Object.values(binds).reduce((dict, key) => {
        dict[key] = false
        return dict
    }, {})

let textInputCache = ''
let actionBIteration = 0
const cheatKillEveryone = 'killEveryone'

export const processControls = (e, game, type) => {
    const player = game.player
    if (!player || !player.level || player.isDead) return

    const key = e.code
    const isKeydown = type === 'keydown'

    if (key === 'Escape' && isKeydown && !game.currentLevel.isComplete) {
        void game.stateManager.runPause(game.currentLevel)
        return
    }

    // cheat
    if (isKeydown) {
        textInputCache = key.replace('Key', '')[0] + textInputCache.slice(0, cheatKillEveryone.length - 1)
        if (textInputCache.split('').reverse().join('').toUpperCase() === cheatKillEveryone.toUpperCase()) {
            player.level.npc.forEach(n => n.die())
            log(player.game, 'Cheater, cheater, pumpkin eater!')
        }
    }

    if (controlKeys.includes(key)) {
        if (isKeydown) {
            document.querySelector(`.player_controls__cap.${key}`)
                .classList.add('player_controls__cap_active')
        } else {
            const caps = document.querySelector(`.player_controls__cap.${key}.player_controls__cap_active`)
            caps && caps.classList.remove('player_controls__cap_active')
        }
    }

    if (movementKeys.includes(key)) {
        player.movementKeyMap[key] = isKeydown
        isKeydown && player.move()
    }


    if (actionKeys.includes(key)) {
        player.actionKeyMap[key] = isKeydown

        if (!isKeydown) {
            actionBIteration = 0
            key === actionBinds.actionB && player.resetERC()
            return
        }

        actionBIteration += 1
        switch (key) {
            case actionBinds.actionA:
                void player.shoot(e)
                break
            case actionBinds.actionB:
                if (player.character?.other?.isNoStickAbility && actionBIteration !== 1)
                    return

                void player.useAbility()
                break
        }
    }
}

export const MBR = swapDict(moveBinds)  // moveBindsReversed

export const getComplexDirection = pressedKeys => {
    const directions = []

    pressedKeys.forEach(key =>
        [CP.N, CP.S].includes(MBR[key]) ?
            directions.unshift(CPR[MBR[key]]) :
            directions.push(CPR[MBR[key]])
    )
    return CP[directions.join('')]
}

export const isPressedButtonsConflictsExist = keyMap =>
    keyMap[MBR.N] && keyMap[MBR.S] || keyMap[MBR.E] && keyMap[MBR.W]