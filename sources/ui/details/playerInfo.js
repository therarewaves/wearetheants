import {element, insert} from '../elements.js'
import {loadDataFromLocalStorage} from '../../game/preloader.js'


export const playerInfo = container =>
    new PlayerInfo(container)

class PlayerInfo {
    constructor(container) {
        const wrapper = element('div', ['player_info'])

        this.player = undefined
        this.attributes = insert(wrapper, element('div', ['player_info__attributes']))
        insert(this.attributes, element('div', ['hover_glass']))

        const attrsWrapper = insert(this.attributes, element('div', ['player_attrs__wrapper']))
        const leftAttrs = insert(attrsWrapper, element('div', ['player_attrs__left'])),
            rightAttrs = insert(attrsWrapper, element('div', ['player_attrs__right'])),
            attr = attrContainer => insert(attrContainer, element('div', ['player_attribute']))

        this.attr_health = attr(leftAttrs)
        this.attr_energy = attr(leftAttrs)
        this.attr_accuracy = attr(leftAttrs)

        this.attr_info_damage = attr(rightAttrs)
        this.attr_info_speed = attr(rightAttrs)
        this.attr_kills = attr(rightAttrs)

        const consoleWrapper = insert(wrapper, element('div', ['player_info__console__wrapper']))
        insert(consoleWrapper, element('div', ['hover_glass']))
        this.console = insert(consoleWrapper, element('textarea', ['player_info__console']))
        this.console.readOnly = true

        this.avatar = insert(wrapper, element('div', ['player_info__avatar']))

        insert(container, wrapper)
    }

    updateStatus = attribute => {
        switch (attribute) {
            case 'health':
                this.attr_health.innerText = `Health: ${this.player.health <= 0 ? 0 : this.player.health}/${this.player.character.attrs.hp} hp`
                break
            case 'energy':
                this.attr_energy.innerText = `Energy: ${this.player.isDead ? 0 : this.player.energy}/${this.player.maxEnergy}`
                break
            case 'kills':
                this.attr_kills.innerText = `Kills: ${this.player.kills}`
                break
            case 'accuracy':
                this.attr_accuracy.innerText = `Accuracy: ${Math.round(this.player.shotsInTargets / this.player.shots * 100) || 0}%`
                break
            case 'characterInfo':
                this.attr_info_damage.innerText = `Damage: ${this.player.character.attrs.damage}`
                this.attr_info_speed.innerText = `Speed: ${this.player.character.attrs.speed}`
                break
        }
    }

    init = player => {
        this.loadAvatar(player.character)
        this.console.value = ''
        this.player = player
    }

    loadAvatar = char => {
        this.avatar.innerHTML = ''
        const img = insert(this.avatar, element('img'))
        img.src = loadDataFromLocalStorage(`${char.images}/avatar.png`)
    }

    writeToConsole = text =>
        this.console.value = `${text}${this.console.value ? '\r\n' : ''}${this.console.value}`
}