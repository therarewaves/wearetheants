import {log} from '../logging.js'
import {getRandomObjectFromList} from '../misc.js'
import {controlButton, element, insert} from '../../ui/elements.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'


const pathFiles = '/static/audio/st/'

const audioFiles = {
    1: 'Ripe Hope - Bad code.mp3',
    2: 'Ripe Hope - Bamboo cake.mp3',
    3: 'Ripe Hope - Bit Lights.mp3',
    4: 'Ripe Hope - Bombs over Head.mp3',
    5: 'Ripe Hope - Bull in a china shop.mp3',
    6: 'Ripe Hope - c14ool.mp3',
    7: 'Ripe Hope - Dukes.mp3',
    8: 'Ripe Hope - Every time I die.mp3',
    9: 'Ripe Hope - I hate Alex Dixon.mp3',
    10: 'Ripe Hope - I hate you more.mp3',
    11: 'Ripe Hope - Joker.mp3',
    12: 'Ripe Hope - Kill em all.mp3',
    13: 'Ripe Hope - Kinder is not a surprise.mp3',
    14: 'Ripe Hope - Logic games.mp3',
    15: 'Ripe Hope - Marmalade.mp3',
    16: 'Ripe Hope - Metro.mp3',
    17: 'Ripe Hope - Mind control cataclysm.mp3',
    18: 'Ripe Hope - Nobody knows I am... Batman.mp3',
    19: 'Ripe Hope - Psideom April.mp3',
    20: 'Ripe Hope - Ripe Hope.mp3',
    21: 'Ripe Hope - Run up the stairs.mp3',
    22: 'Ripe Hope - Trial injection.mp3'
}

export const musicController = (container, game, playControl) =>
    new MusicController(container, game, playControl)

class MusicController {
    constructor(container, game, playControl) {
        this.game = game
        this.playControl = playControl
        this.path = pathFiles
        this.playlist = audioFiles
        this.currentAudio = undefined
        this.filesExt = '.mp3'
        this.defaultVolume = 0.2
        this.volume = this.defaultVolume

        this.played = []

        const muteVolume = insert(container,
            controlButton('volume', 'Volume', ['volume_mute']))

        muteVolume.addEventListener('click', () => {
            if (this.volume) {
                this.prevVolume = this.volume
                this.volume = 0
            } else
                this.volume = this.prevVolume

            this.currentAudio && (this.currentAudio.volume = this.volume)
            this.volumeControl.value = this.volume * 100
        })

        const volumeControl = insert(container, element('input', ['volume_control']))
        volumeControl.type = 'range'
        volumeControl.max = 100
        volumeControl.value = this.volume * 100

        volumeControl.addEventListener('input', e => {
            const value = e.target.value
            this.volume = value / 100
            this.currentAudio && (this.currentAudio.volume = this.volume)
        })
        this.volumeControl = volumeControl
    }

    loadAudio = (name, path = this.path) => {
        this.currentAudio = new Audio(`${path}${name}`)
        this.currentAudio.volume = this.volume
        this.currentAudio.addEventListener('ended',
            () => this.playNext())

        log(this.game, `Now playing: ${name.replace(this.filesExt, '')}`)
    }

    playPause = () => {
        if (!this.currentAudio)
            this.playNext()
        else
            this.currentAudio.paused ? this.currentAudio.play() : this.currentAudio.pause()

        this.switchPlayPauseControl(!this.currentAudio.paused)
    }

    stop = () => {
        if (!this.currentAudio) return
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.switchPlayPauseControl(!this.currentAudio.paused)
    }

    playPrevious = () => {
        if (!this.played.length && !this.currentAudio)
            return

        const prevAudio = this.played.at(-2)
        if (!prevAudio) {
            this.stop()
            this.playPause()
            return
        }

        this.stop()
        this.loadAudio(this.playlist[prevAudio])
        this.playPause()
    }

    playNext = () => {
        this.stop()

        const queue = Object.keys(this.playlist).filter(n => !this.played.includes(n))

        if (!queue.length) {
            this.played = []
            this.playNext()
            return
        }

        const next = getRandomObjectFromList(queue)
        this.played.push(next)

        this.loadAudio(this.playlist[next])
        this.playPause()
    }

    switchPlayPauseControl = (isRun) =>
        this.playControl.src = loadDataFromLocalStorage(`/static/icons/${isRun ? 'pause' : 'play'}.png`)
}
