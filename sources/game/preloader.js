const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

export const preloadAssets = async (assets, cssVariables, isNoScripts) => {
    if (!isChrome || isNoScripts)
        assets.scripts = []

    const total = Object.keys(assets).reduce((sum, group) => sum + assets[group].length, 0)

    let left = await _preloadData('style', assets.styles, total, total)
    left = await _preloadData('font', assets.fonts, left, total)
    left = await _preloadData('image', assets.images, left, total)
    await _preloadData('script', assets.scripts, left, total)
    if (cssVariables)
        _changeCssLinks(cssVariables)
}

const updateLoadingStatus = val =>
    document.querySelector('.loading').innerText = `Loading... ${val}%`

export const loadDataFromLocalStorage = key => {
    try {
        const data = JSON.parse(localStorage.getItem(key))
        return `data:${data.type}/${data.ext};base64,${data.value}`
    } catch (error) {
        console.error(`Cannot load file from the local storage: ${key}`)
        return key
    }
}

const _preloadData = (type, data, left, total) =>
    new Promise(resolve => {
        if (data.length === 0) resolve(left)
        const loaded = {}

        const confirmFileLoading = src => {
            loaded[src] = true
            left -= 1
            updateLoadingStatus(100 - Math.round(left / total * 100))
            if (!Object.values(loaded).includes(false))
                resolve(left)
        }

        data.forEach(async src => {
            loaded[src] = false
            let obj

            switch (type) {
                case 'image':
                    obj = document.createElement('img')
                    obj.src = src.toString()
                    break
                case 'font':
                    obj = new FontFace(String(src.split('/').pop().split('.').shift()), `url(${src})`)
                    await obj.load()
                    document.fonts.add(obj)
                    confirmFileLoading(src)
                    break
                case 'script':
                    obj = document.createElement('link')
                    obj.rel = 'modulepreload'
                    obj.href = src
                    document.head.appendChild(obj)
                    break
                case 'style':
                    obj = document.createElement('link')
                    obj.rel = 'stylesheet'
                    obj.href = src
                    document.head.appendChild(obj)
                    break
            }

            if (obj && type !== 'font')
                obj.onload = async () => {
                    switch (type) {
                        case 'image':
                            const saveImage = value =>
                                localStorage.setItem(src, JSON.stringify({
                                    type: type, value: value, ext: getFileExt(src)
                                }))

                            if (getFileExt(src) === 'gif')
                                await saveGif(saveImage, src)
                            else
                                saveImage(getBase64Image(obj))
                            break
                    }
                    confirmFileLoading(src)
                }
        })
    })

const saveGif = async (saveImage, gifSrc) => {
    const blob = await loadXHR(gifSrc)

    new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            saveImage(reader.result.replace(/^data:image\/(png|gif);base64,/, ''))
            resolve(true)
        }

        if (blob && blob.constructor.name === 'Blob')
            reader.readAsDataURL(Object(blob))
    })
}

const loadXHR = url =>
    new Promise((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url)
            xhr.responseType = 'blob'
            xhr.onerror = () => reject('Network error')
            xhr.onload = () =>
                xhr.status === 200 ? resolve(xhr.response) : reject(`Loading error: ${xhr.statusText}`)
            xhr.send()
        } catch (err) {
            reject(err.message)
        }
    })

const getBase64Image = img => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)
    const dataURL = canvas.toDataURL(`image/${getFileExt(img.src)}`)
    return dataURL.replace(/^data:image\/(png|gif);base64,/, '')
}

const getFileExt = filename =>
    filename.split('.').pop()

const _changeCssLinks = cssVariables => {
    const root = document.querySelector(':root')
    Object.keys(cssVariables).forEach(item =>
        root.style.setProperty(item, `url(${loadDataFromLocalStorage(cssVariables[item])})`))
}