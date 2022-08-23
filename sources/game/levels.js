import {arenaSettings, level} from '../engine/game/level.js'
import {extraPointsBonus, healingBonus, rechargingBonus, explosionBonus, energyShieldBonus} from './bonuses.js'


const regularBonusSet = [healingBonus, rechargingBonus, extraPointsBonus, explosionBonus, energyShieldBonus]

export const levels = game => [
    level(game, 'RG0E1Z', 'Level 1', ['elimination', 'puzzle'],
        arenaSettings({
            height: 1200,
            background: '/static/images/bg/sand.png',
            antColonies: [
                {worker: 4, warrior: 14, queen: 1, color: '#41ABD8'},
                {worker: 10, warrior: 2, queen: 2, color: '#baec51'},
            ]
        }),
        regularBonusSet),

    level(game, 'L1DV2W', 'Level 2', ['elimination', 'puzzle'],
        arenaSettings({
            width: 1200,
            background: '/static/images/bg/road.png',
            antColonies: [
                {worker: 15, warrior: 15, queen: 1, color: '#a87dea'},
            ]
        }),
        regularBonusSet),

    level(game, 'B03FB2', 'Level 3', ['elimination', 'puzzle'],
        arenaSettings({
            width: 1200,
            height: 1200,
            background: '/static/images/bg/desert.png',
            antColonies: [
                {worker: 10, warrior: 4, queen: 1, color: '#38af34'},
                {worker: 10, warrior: 5, queen: 1, color: '#ec5180'},
                {worker: 10, warrior: 5, queen: 2, color: '#b8fffa'},
            ]
        }),
        regularBonusSet),

    level(game, 'Y41DG9', 'Level 4', ['elimination', 'puzzle'],
        arenaSettings({
            background: '/static/images/bg/poorGrass.png',
            antColonies: [
                {worker: 10, warrior: 4, queen: 1, color: '#0a8ef8'},
                {worker: 5, warrior: 5, queen: 1, color: '#a0e74b'},
                {worker: 7, warrior: 10, queen: 3, color: '#ebfd3e'},
            ]
        }),
        regularBonusSet),

    level(game, 'R55L3', 'Level 5', ['elimination', 'puzzle'],
        arenaSettings({
            width: 1200,
            height: 1200,
            background: '/static/images/bg/mars.png',
            antColonies: [
                {worker: 10, warrior: 4, queen: 1, color: '#7f29ff'},
                {worker: 5, warrior: 5, queen: 1, color: '#e74b82'},
                {worker: 10, warrior: 15, queen: 4, color: '#3e9efd'},
            ]
        }),
        regularBonusSet),
]