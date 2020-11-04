const fs = require("fs");
const path = require('path');

function isInfoExists(gameName) {
    return (gameName === "" || !!(gameName) || (typeof gameName) === "string")
}

function isCouchOrFeaturesExists(couch) {
    return !!couch
}

// function gatGamesNames() {
//     const gamePath = path.resolve(`../games`);
//     let gamesNames = [];
//     let gamesFoldersName = []
//     fs.readdirSync(gamePath).forEach(file => {
//         gamesFoldersName.push(file.trim());
//     });
//     for (let i = 0; i<gamesFoldersName.length; i++) {
//         let gameFolderName=gamesFoldersName[i]
//         let path=`${gamePath}/${gameFolderName}/gameInfo.json`;
//         let gameInfo = JSON.parse(fs.readFileSync(path, 'utf8'));
//         let gameName = gameInfo.gameName;
//         gamesNames.push(gameName);
//     }
//     return {"gamesNames":gamesNames,
//         "gamesFoldersName":gamesFoldersName
//     }
// }
function gatGamesAndFoldersNames() {
    const gamePath = path.resolve(`../games`);
    let obj = {}
    fs.readdirSync(gamePath).forEach(file => {
        let folderName = file.trim()
        let path = `${gamePath}/${folderName}/gameInfo.json`;
        let gameInfo = JSON.parse(fs.readFileSync(path, 'utf8'));
        obj[folderName] = gameInfo.gameName;
    });
    return obj;
}

module.exports = {
    isInfoExists: isInfoExists,
    isCouchOrFeaturesExists: isCouchOrFeaturesExists,
    gatGamesAndFoldersNames:gatGamesAndFoldersNames
}