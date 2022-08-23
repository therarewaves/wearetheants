import {capitalizeFirstLetter, getRandomColor, getRandomInt, getRandomObjectFromList} from '../misc.js'
import {element, insert} from '../../ui/elements.js'
import {Ant} from './ant.js'


export const antColony = (level, settings = {}) => {
    if (!level.colonies) level.colonies = []
    const newAntColony = new AntColony({level: level, ...settings})
    level.colonies.push(newAntColony)
    return newAntColony
}

class AntColony {
    static pk = 0

    static defaultPopulation = {
        'queen': 0,
        'warrior': 0,
        'worker': 0
    }

    constructor(settings) {
        this.id = ++AntColony.pk
        this.level = settings.level
        this.name = getRandomObjectFromList(colonyNames)
        this.color = settings.color || getRandomColor()
        this.ants = []

        this.spawnColonyPopulation(
            Object.keys(AntColony.defaultPopulation).reduce((dict, param) => {
                dict[param] = settings[`${param.replace(/^\w/, (c) => c)}`]
                return dict
            }, {})
        )

        this.level.npc.push(...this.ants)
    }

    spawnColonyPopulation = population =>
        Object.keys(AntColony.defaultPopulation).forEach(antType => {
            !population[antType] && (population[antType] =
                getRandomInt(AntColony.defaultPopulation[antType], AntColony.defaultPopulation[antType] * 2))
            this.spawnAnts(antType, population[antType])
        })

    spawnAnts = (type, quantity = 1) => {
        !this[type] && (this[type] = [])

        for (let i = 0; i < quantity; i++) {
            const ant = new (Ant.getSubclass(type))(this)
            this[type].push(ant)
            this.ants.push(ant)
            ant.spawn(type)
        }
    }

    getColonyInfo = () => {
        const wrapper = element('div', ['colony__info'])
        wrapper.dataset.colonyId = this.id

        const colonyName = insert(wrapper, element('div', ['colony__name'], this.name))
        colonyName.style.backgroundColor = this.color

        const addColonyInfo = (caption, param, value) => {
            const colonyParam = insert(wrapper, element('div', ['colony__param'], `${caption}: ${value}`))
            colonyParam.dataset.type = param
        }

        ['queen', 'warrior', 'worker'].forEach(param =>
            addColonyInfo(`${capitalizeFirstLetter(param)}s`, param, this[param].length))

        return wrapper
    }
}

const colonyNames = [
    'Rogue Raiders', 'Norse Network', 'Blade Legion', 'Aces', 'Bounty Seekers', 'Carnage Epidemic', 'Plague',
    'Heathen Heroes', 'Death Wish', 'Feudal Overlords', 'Fury Guild', 'Embers Rising', 'Alchemy Assault',
    'Immortal Dynasty', 'Rune Writers', 'Warfare Wounds', 'The Soil Force', 'Zone Avengers', 'The Barbarians',
    'Thunders', 'The Conquerors'
]