import {element, insert} from '../elements.js'
import {actionBinds, moveBinds, processControls, keyCaptions} from '../../engine/player/controls.js'
import {flattenArray} from '../../engine/misc.js'
import {CP} from '../../engine/physics/cpmovement.js'


export const playerControls = (game, container) => {
    const wrapper = element('div', ['player_controls'])
    insert(wrapper, leftSidePlayerControls(game))
    insert(wrapper, rightSidePlayerControls(game))

    document.addEventListener('keydown', e => processControls(e, game, 'keydown'))
    document.addEventListener('keyup', e => processControls(e, game, 'keyup'))
    insert(container, wrapper)
    return wrapper
}

const leftSidePlayerControls = player =>
    controlsGroup(player, 'left', moveBinds, {
        firstLine: [CP.N],
        secondLine: [CP.W, CP.S, CP.E]
    })

const rightSidePlayerControls = player =>
    controlsGroup(player, 'right', actionBinds, {
        firstLine: ['actionB'],
        secondLine: ['actionA']
    })

const controlsGroup = (player, side, binds, mapping) => {
    const wrapper = element('div', [`player_controls__${side}`])

    const lines = {
        firstLine: element('div', ['player_controls__line']),
        secondLine: element('div', ['player_controls__line'])
    }

    bindCaps(player, binds, lines, mapping)
    Object.keys(lines).forEach(line =>
        insert(wrapper, lines[line]))

    return wrapper
}

const bindCaps = (player, binds, lines, mapping) => {
    flattenArray(mapping).forEach(action => {
        for (const [line, actions] of Object.entries(mapping)) {
            if (actions.includes(action)) {
                insert(lines[line], cap(binds, action, keyCaptions[binds[action]]))
            }

        }
    })
}

const cap = (group, action, caption) =>
    element('span', ['player_controls__cap', group[action]], caption)