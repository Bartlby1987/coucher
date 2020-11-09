const fs = require("fs");
const path = require('path');
let config = require('@root/config.json');

function isInfoExists(gameName) {
    return (gameName === "" || !!(gameName) || (typeof gameName) === "string")
}

function isCouchOrFeaturesExists(couch) {
    return !!couch
}

function getGamesAndFoldersNames() {
    const gamePath = path.resolve(config.gamesFolderPath);
    let games = []
    fs.readdirSync(gamePath).forEach(file => {
        let folderName = file.trim()
        let path = `${gamePath}/${folderName}/gameInfo.json`;
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