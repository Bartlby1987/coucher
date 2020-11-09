const fs = require("fs");
const path = require('path');
let config = require('@src/utils/config');

function isInfoExists(gameName) {
    return (gameName === "" || !!(gameName) || (typeof gameName) === "string")
}

function isCouchOrFeaturesExists(couch) {
    return !!couch
}

function getGamesAndFoldersNames() {
    let games = []
    fs.readdirSync(config.gamesFolderPath).forEach(file => {
        let folderName = file.trim()
        let path = `${config.gamesFolderPath}/${folderName}/gameInfo.json`;
        let gameInfo = JSON.parse(fs.readFileSync(path, 'utf8'));
        games.push({folderName: folderName, gameName: gameInfo.gameName});
    });
    return games;
}

module.exports = {
    isInfoExists: isInfoExists,
    isCouchOrFeaturesExists: isCouchOrFeaturesExists,
    getGamesAndFoldersNames:getGamesAndFoldersNames
}