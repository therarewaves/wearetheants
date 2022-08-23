export const convertSecondsToTime = seconds =>
    new Date(seconds * 1000).toISOString().substr(11, 8)

const formatTime = date => {
    const leadingZero = num => `0${num}`.slice(-2)
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(leadingZero).join(':')
}

export const log = (game, text) =>
    game.ui.gameInterface.playerInfo.writeToConsole(`[${formatTime(new Date())}] ${text}`)