const cheerio = require('cheerio');
const request = require('sync-request');
const {logInfo, logError} = require("./utils/logUtils");
const {isInfoExists, isCouchOrFeaturesExists} = require("./utils/fileUtils");

const generateDataPageUrl = (value) => `https://www.co-optimus.com/ajax/ajax_games.php?game-title-filter=&system=28&countDirection=at%20least&playerCount=2&couch=true&page=${value}&sort=&sortDirection=`

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
    let gameName = tdNameAndGenre.children[0].children[0].data
    if (isInfoExists(gameName)) {
        let genre = tdNameAndGenre.children[3].children[0].data
        if (isInfoExists((genre))) {
            let tdCouch = gameRow.childNodes[5];
            let couch = tdCouch.children[0].data;
            if (isCouchOrFeaturesExists(couch)) {
                let tdFeatures = gameRow.children[9];
                let featuresInfoArray = tdFeatures.children;
                if (isCouchOrFeaturesExists(featuresInfoArray)) {
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
                    if (isInfoExists(releaseDate)) {
                        logInfo(`Parsing game (${gameName}) has been successfully completed`)
                        return {
                            "game": gameName,
                            "genre": genre,
                            "couch": couch,
                            "features": features,
                            "releaseDate": releaseDate
                        };
                    } else {
                        logError(`Error.Release date is not exists`);
                    }
                } else {
                    logError(`Error.Features not found`);
                }
            } else {
                logError(`Error.Couch not found`);
            }
        } else {
            logError(`Error.Genre not found`);
        }
    } else {
        logError(`Error. Game not found`);
    }
}


console.log(getGamesInfo());