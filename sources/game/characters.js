import {PlayerCharacter} from '../engine/player/player.js'
import {acceleration, energyShield, multiShot} from '../engine/player/abilities.js'


export const chars = [
    new PlayerCharacter(
        'UFO',
        'Fragile though nimble. Fires a shower of lead. Cannot be identified or explained',
        {hp: 50, damage: 10, speed: 3, width: 48, height: 48},
        '<p>hp: +</p><p>damage ++</p><p>speed +++</p>',
        '/static/images/chars/ufo',
        multiShot,
        {isNoStickAbility: true}
    ),

    new PlayerCharacter(
        'Nasty Crab',
        'Well balanced character. Being on adrenaline can move very quickly, which often saves his life',
        {hp: 100, damage: 10, speed: 2, width: 48, height: 48},
        '<p>hp: ++</p><p>damage ++</p><p>speed ++</p>',
        '/static/images/chars/crab',
        acceleration
    ),

    new PlayerCharacter(
        'Old Turtle',
        'A slow mountain. Has not only remarkable health, but also effective energy shield',
        {hp: 200, damage: 5, speed: 1, width: 48, height: 48},
        '<p>hp: ++++</p><p>damage +</p><p>speed +</p>',
        '/static/images/chars/turtle',
        energyShield,
        {isNoStickAbility: true}
    )
]