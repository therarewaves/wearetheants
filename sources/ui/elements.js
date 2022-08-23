import {sleep} from '../engine/misc.js'
import {loadDataFromLocalStorage} from '../game/preloader.js'


const _iconsPath = '/static/icons/'

export const show = (element, style = 'block') =>
    element.style.display = style

export const hide = element =>
    element.style.display = 'none'

export const insert = (container, object, position = 'beforeend') =>
    container.insertAdjacentElement(position, object)

export const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)
    classes.length && node.classList.add(...classes)
    content && (node.innerHTML = content)
    return node
}

export const controlButton = (iconName, title, classes = []) => {
    const controlElement = element('img', ['icon'].concat(classes))
    controlElement.src = loadDataFromLocalStorage(`${_iconsPath}${iconName}.png`)
    controlElement.title = title
    return controlElement
}

export const isElementsOverlap = (obj1, obj2) => {
    if (obj1?.sector !== obj2?.sector) return false

    const rect1 = obj1.unit.getBoundingClientRect(),
        rect2 = obj2.unit.getBoundingClientRect()

    return !(rect1.right < rect2.left || rect1.left > rect2.right ||
        rect1.bottom < rect2.top || rect1.top > rect2.bottom)
}

export const removeClassByMask = (element, mask) => {
    let re = new RegExp('\\b' + mask.replace(/\*/g, '\\S+') + '', 'g')
    element.className = Array.from(element.classList).filter(cl => !re.test(cl.toString())).join(' ')
}

export const waitForElement = async selector => {
    await sleep(100)
    const expectedElement = document.querySelector(selector)
    if (expectedElement)
        return expectedElement
    await waitForElement(selector)
}

export const svgPath = (coordinates, color, width) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', coordinates)
    path.setAttribute('fill', 'transparent')
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', width)
    return path
}