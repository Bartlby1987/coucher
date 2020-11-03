const fs = require("fs");
const cheerio = require('cheerio');
const request = require('sync-request');
const mkdirp = require('mkdirp');
const {logInfo, logError} = require("./utils/logUtils");
const {isInfoExists, isCouchOrFeaturesExists} = require("./utils/infoUtils");
const generateDataPageUrl = (value) => `https://www.co-optimus.com/ajax/ajax_games.php?game-title-filter=&system=28&countDirection=at%20least&playerCount=2&couch=true&page=${value}&sort=&sortDirection=`
const path = require('path');
function getGamesInfo() {
    let i = 1;
    let gamesInfo = [];
    try {
        while (true) {
            let res = request('GET', encodeURI(generateDataPageUrl(i)), {});
            let htmlSearchPage = cheerio.load(res.body);
            let tableGames = htmlSearchPage(`#results_table > tbody`);
            if (!(tableGames.children().length === 0)) {
                let gamesTable = tableGames.children();
                for (let j = 0; j < gamesTable.length; j++) {
                    let gameRow = gamesTable[j];
                    let info = parseRow(gameRow);
                    if (!info) {
                        logError(`Game information on page № ${i} row № ${j + 1} has bee parsing with error`)
                    } else {
                        gamesInfo.push(info);
                    }
                }
                i++;
            } else {
                break;
            }
        }
    } catch (err) {
        console.error("Technical error :" + err);
    }
    return gamesInfo;
}

function parseRow(gameRow) {
    let tdNameAndGenre = gameRow.childNodes[1];
    let firstChild = tdNameAndGenre.children[0];
    let gameName = firstChild.children[0].data;
    let urlGame = firstChild.parent.children[2].attribs.href;
    ;
    let folderName = urlGame.match(/.*nintendo-switch\/(.*?).html/)[1];
    if (!isInfoExists(gameName)) {
        logError(`Error. Game not found`);
        return;
    }
    let genre = tdNameAndGenre.children[3].children[0].data;
    if (!isInfoExists((genre))) {
        logError(`Error.Genre not found`);
        return;
    }
    let tdCouch = gameRow.childNodes[5];
    let couch = tdCouch.children[0].data;
    if (!isCouchOrFeaturesExists(couch)) {
        logError(`Error.Couch not found`);
        return;
    }
    let tdFeatures = gameRow.children[9];
    let featuresInfoArray = tdFeatures.children;
    if (!isCouchOrFeaturesExists(featuresInfoArray)) {
        logError(`Error.Features not found`);
        return;
    }
    let features = [];
    for (let k = 0; k < featuresInfoArray.length; k++) {
        let oneFeature = featuresInfoArray[k];
        let attribs = oneFeature["attribs"];
        let featuresInfo = attribs["title"];
        features.push(featuresInfo);
    }
    let tdReleaseInfo = gameRow.children[15];
    let releaseInfo = tdReleaseInfo.children[0];
    let releaseDate = releaseInfo.children[0].data;
    if (!isInfoExists(releaseDate)) {
        logError(`Error.Release date is not exists`);
        return
    }
    logInfo(`Parsing game (${gameName}) has been successfully completed`)
    return {
        "folderName": folderName,
        "gameName": gameName,
        "genre": genre,
        "couch": couch,
        "features": features,
        "releaseDate": releaseDate
    };
}

function createFoldersGamesInfo() {
    try {
        let gamesInfo = getGamesInfo();
        if (gamesInfo.length === 0) {
            logError("Games not found.")
            return;
        }
        for (let i = 0; i < gamesInfo.length; i++) {
            let gameInfo = gamesInfo[i];
            let folderName = gameInfo.folderName;
            let pathFolder = path.resolve(`../`);
            mkdirp.sync(`${pathFolder}/games/${folderName}/images/`);
            let gameInfoPath = `${pathFolder}/games/${folderName}/gameInfo.json`;
            fs.writeFileSync(gameInfoPath, JSON.stringify(gameInfo));
        }
    } catch (err) {
        console.error("Technical error", err);
    }
}

createFoldersGamesInfo()