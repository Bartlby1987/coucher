let shelljs = require('shelljs');

function isFolderExists(gamesDataPath) {
    return shelljs.exec(`[ -d "${gamesDataPath}" ] && echo "true"`).stdout.trim() === 'true'
}

function isFileExists(gamesDataPath) {
    return shelljs.exec(`[ -f "${gamesDataPath}" ] && echo "true"`).stdout.trim() === 'true'
}

module.exports = {
    isFileExists: isFileExists,
    isFolderExists: isFolderExists
}