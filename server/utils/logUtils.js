const log4js = require("log4js");

log4js.configure({
    appenders: {
        dateFile: {type: 'dateFile', filename: 'logs/server.log', pattern: '.yyyy-MM-dd-hh'},
        console: {type: 'console'}
    },
    categories: {default: {appenders: ["dateFile", "console"], level: "debug"}}
});

let defaultLogger = log4js.getLogger("default");

function logInfo(message) {
    defaultLogger.info(message)
}

function logError(message) {
    defaultLogger.error(message)
}

module.exports = {
    logError: logError,
    logInfo: logInfo,
    getLogger: log4js.getLogger
}