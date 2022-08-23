import {shoot} from '../physics/shooting.js'
import {actionBinds, mouseKeyMap} from './controls.js'
import {getCenterCoordinates, getRandomInt, sleep} from '../misc.js'


export const multiShot = async (player, isFree = false) => {
    const energyCost = 17

    if (!isFree) {
        if (player.energy < energyCost) return
        player.energy -= energyCost
    }

    const playerCoord = getCenterCoordinates(player)

    const bulletCoordOffset = [
        {x: 0, y: 100},
        {x: 100, y: 100},
        {x: 100, y: 0},
        {x: 100, y: -100},
        {x: 0, y: -100},
        {x: -100, y: -100},
        {x: -100, y: 0},
        {x: -100, y: 100},
    ]

    for (const offset of bulletCoordOffset) {
        await sleep(getRandomInt(1, 25))
        await shoot(player, {x: playerCoord.x + offset.x, y: playerCoord.y + offset.y})
    }
}

export const acceleration = async player => {
    await sleep(100)

    const energyCost = 2,
        prolongationTimeCostMs = 100,
        acceleratedSpeedRatio = 2

    if (player.isAccelerated || player.energy < energyCost) return

    const stopAcceleration = key => {
        if (key && key.code !== actionBinds.actionB) return
        player.speed = player.character.attrs.speed
        player.isAccelerated = false
        player.body.classList.remove('ability__acceleration')
        player.resetERC()
        document.removeEventListener('keyup', stopAcceleration)
    }

    const startAcceleration = () => {
        player.energy -= energyCost
        player.speed *= acceleratedSpeedRatio
        player.isAccelerated = true
        player.body.classList.add('ability__acceleration')
    }

    startAcceleration()
    document.addEventListener('keyup', stopAcceleration)

    while ((player.actionKeyMap[actionBinds.actionB] || mouseKeyMap.right) && player.energy >= energyCost) {
        await sleep(prolongationTimeCostMs)
        player.energy -= energyCost
        player.updateStatus('energy')
    }
    stopAcceleration()
}

export const energyShield = async (player, isFree = false) => {
    const energyCost = 80
    const energyShieldDurationSec = 3

    if (!isFree) {
        if (player.energy < energyCost) return
        player.energy -= energyCost
    }

    if (player.isEnergyShieldActivated) return

    const switchEnergyShield = isOn => {
        player.isEnergyShieldActivated = isOn
        player.isIgnoreDamage = isOn
        player.unit.classList.toggle('ability__energy_shield', isOn)
    }

    switchEnergyShield(true)
    player.resetERC(150)
    await sleep(energyShieldDurationSec * 1000)
    switchEnergyShield(false)
}