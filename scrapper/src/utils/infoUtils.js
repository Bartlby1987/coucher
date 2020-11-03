const fs = require("fs");
const path = require('path');

function isInfoExists(gameName) {
    return (gameName === "" || !!(gameName) || (typeof gameName) === "string")
}

function isCouchOrFeaturesExists(couch) {
    return !!couch
}

function gatGamesNames() {
    const gamePath = path.resolve(`../games/`);
    let gamesName = []
    fs.readdirSync(gamePath).forEach(file => {
        gamesName.push(file.trim());
    })
    return gamesName;
}

module.exports = {
    isInfoExists: isInfoExists,
    isCouchOrFeaturesExists: isCouchOrFeaturesExists,
    gatGamesNames:gatGamesNames
}