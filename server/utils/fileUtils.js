let shelljs = require('shelljs');

function isFolderExists(gamesDataPath) {
    return shelljs.test(`-d`, gamesDataPath)
}

function isFileExists(gamesDataPath) {
     return shelljs.test(`-f`, gamesDataPath)
}

module.exports = {
    isFileExists: isFileExists,
    isFolderExists: isFolderExists
}