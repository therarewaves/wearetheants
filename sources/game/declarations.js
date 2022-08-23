import {goBackToMainMenu} from '../ui/menu/mainMenu.js'
import {broadcast} from '../ui/broadcast.js'

export const gameIntro = async container => {
    const bc = await broadcast(container)
    await bc.say('Save the world!', {displaySec: 2})
    await bc.say('Okay, Ready?', {displaySec: 1.5})
    bc.close()
}

export const levelIntro = async (container, level) => {
    const bc = await broadcast(container, false)
    await bc.say(level.intro, {displaySec: 2})
    bc.close()
}

export const gameOutro = async container => {
    const bc = await broadcast(container)
    await bc.say('Good job!', {displaySec: 2, ensuredFreezingSec: 1})
    await bc.say('Thank you for playing!', {displaySec: 2, ensuredFreezingSec: 1})
    bc.close()
}

export const briefing = async (container, game) => {
    const bc = await broadcast(container, false)
    bc.channel.classList.add('briefing')
    const callback = () => goBackToMainMenu(game)
    for (const [i, paragraph] of _briefingText.entries())
        await bc.say(paragraph, {callback: i === _briefingText.length - 1 ? callback : undefined, isTypingEffect: true})
    bc.close()
}

const _briefingText = [
    `Good Morning, Vietnam! There are some bloody ants we're going to kill!\n
    Now, each of you has a proper skill that should help to eliminate the enemies.\n
    Use it with care, it will cost you some energy`,

    `Our backup will be dropping some containers with power-ups, find them rapidly!\n
    To restore the energy pick up a lightning power-up or just wait.\n
    The energy can also be restored automatically when you don't use your specials`,

    `In any situation use your bloody bullets! We have plenty of them indeed.\n
    Be careful, though! Queens shooting provokes the warriors. Hit and run!\n
    Finally, your secret mission is collecting a puzzle in any bloody area you'll be dropped!`,

    `To finish a level you must either collect a puzzle or kill everyone\n
    (Your grannies will gather everything later when the place is safe)\n
    Ways to the pieces of puzzles will indicate your inner sense.\n
    Bad luck, bastards! May the bloody queen bless you!`
]

export const credits = async (container, game) => {
    const bc = await broadcast(container)
    bc.channel.classList.add('credits')
    const callback = () => goBackToMainMenu(game)
    await bc.say('text on: therarewaves@gmail.com', {callback: callback})
    bc.close()
}