const log4js = require("log4js");

const initTime = new Date().toISOString();
log4js.configure({
    appenders: {
        dateFile: {type: 'dateFile', filename: `../logs/scrapper.${initTime}.log`, pattern: '.yyyy-MM-dd'},
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

module.exports.formatTotalInfo = function (gamesAmount, counters) {
    return ` Total number of games: (${gamesAmount}); 
          games not found: (${counters.notFoundGame});
          metascore has been found: (${counters.metaScoreFound});
          metascore not found: (${counters.metaScoreNotFound});
          user score has been found: (${counters.userScoreFound});
          user score not found: (${counters.userScoreNotFound});
          `;
}

module.exports.createCounters = () => {
    return {
        metaScoreFound: 0,
        metaScoreNotFound: 0,
        userScoreFound: 0,
        userScoreNotFound: 0,
        notFoundGame: 0
    };
}
