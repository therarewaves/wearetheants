export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max + 1 - min)) + min

export const getRandomObjectFromList = list =>
    list[getRandomInt(0, list.length - 1)]

export const getRandomColor = () =>
    "#" + ((1 << 24) * Math.random() | 0).toString(16)

export const swapDict = dict =>
    Object.keys(dict).reduce((ret, key) => {
        ret[dict[key]] = parseInt(key) || key
        return ret
    }, {})

export const flattenArray = array => {
    if (array.constructor === Object)
        array = Object.values(array)

    const res = []
    array.forEach(item =>
        Array.isArray(item) ?
            flattenArray(item).forEach(innerItem =>
                res.push(innerItem))
            : res.push(item)
    )
    return res
}

export const capitalizeFirstLetter = string =>
    String(string).charAt(0).toUpperCase() + string.slice(1)

export const getCenterCoordinates = object => ({
    x: object.unit.offsetLeft + object.width / 2,
    y: object.unit.offsetTop + object.height / 2
})