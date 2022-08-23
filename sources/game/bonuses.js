import {Player} from '../engine/player/player.js'
import {bonus} from '../engine/game/bonus.js'
import {multiShot, energyShield} from '../engine/player/abilities.js'
import {log} from '../engine/logging.js'


export const healingBonus =
    bonus('Healing', 'medkit.png', 5,
        player => {
            log(player.game, 'Point your imperceptible trauma')
            const increment = 10
            if (player.health + increment > player.character.attrs.hp)
                player.health = player.character.attrs.hp
            else
                player.health += increment
            player.updateStatus('health')
        })

export const rechargingBonus =
    bonus('Recharging', 'batteries.png', 5,
        player => {
            log(player.game, 'I\'m a bundle of energy today!')
            player.energy = Player.specs.maxEnergy
            player.updateStatus('energy')
        })

export const extraPointsBonus =
    bonus('ExtraPoints', 'coin.png', 100, player => log(player.game, 'Money money money!'))

export const explosionBonus =
    bonus('Explosion', 'bomb.png', 5,
        player => {
            log(player.game, 'KABOOM!!')
            void multiShot(player, true)
        })

export const energyShieldBonus =
    bonus('EnergyShield', 'shield.png', 5,
        player => {
            log(player.game, 'Yeah! Feel safe!')
            void energyShield(player, true)
        })