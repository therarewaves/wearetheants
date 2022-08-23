import {element, insert, waitForElement} from './elements.js'
import {sleep} from '../engine/misc.js'

export const broadcast = async (container, isTransparentBg) => {
    const bc = new Broadcast(container, isTransparentBg)
    await bc.init()
    return bc
}

const broadcastCycleFrames = 25,
    broadcastCycleRoundLengthMs = 1000 / broadcastCycleFrames

class Broadcast {
    static pk = 0

    constructor(container, isTransparentBg = false) {
        const channel = insert(container, element('div', ['broadcast']))
        this.id = `broadcast${++Broadcast.pk}`
        channel.id = this.id
        isTransparentBg && channel.classList.add('broadcast_transparent')
        this.channel = undefined
    }

    init = async () =>
        this.channel = await waitForElement(`#${this.id}`)

    close = () =>
        this.channel.remove()

    say = async (text, options) => {
        if (!this.channel) {
            console.error('Init the broadcast first')
            return
        }

        const ensuredFreezingSec = options?.ensuredFreezingSec || 0

        let isShowing = true,
            isFrozen = ensuredFreezingSec > 0

        let stopTyping = false
        const pressAnyKeyListener = async e => {
            if (isFrozen) return
            isShowing = false
            options?.callback && options.callback(e)
            options?.isTypingEffect && (stopTyping = true)
            document.removeEventListener('keydown', pressAnyKeyListener)
            document.removeEventListener('click', pressAnyKeyListener)
        }

        document.addEventListener('keydown', pressAnyKeyListener)
        document.addEventListener('click', pressAnyKeyListener)

        if (options?.isTypingEffect) {
            const typingEffectDelay = 35,
                rows = text.split('\n')

            for (const [i, row] of rows.entries()) {
                i === 0 && (this.channel.innerHTML = '')
                const p = insert(this.channel, element('p'))
                for (const letter of row.split(/()/)) {
                    p.innerHTML += letter
                    if (stopTyping) return
                    await sleep(typingEffectDelay)
                }
                if (i === rows.length - 1)
                    insert(p, element('span', ['briefing__cursor']))
            }
        } else
            this.channel.innerHTML = text

        for (let round = 0; isShowing; round++) {
            await sleep(broadcastCycleRoundLengthMs)
            const passedSec = Math.round(round / broadcastCycleFrames)
            if (ensuredFreezingSec > 0 && ensuredFreezingSec > passedSec) continue
            isFrozen = false
            if (options?.displaySec > 0 && options?.displaySec <= passedSec) return
        }
    }
}