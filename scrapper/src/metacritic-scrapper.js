const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const path = require('path');
const {gatGamesAndFoldersNames} = require("./utils/infoUtils");
const URL_SITE_PAGE = `https://www.metacritic.com/`;
const logger = require('./utils/logUtils').getLogger("metacritic-checker");
const getSearchGamePage = (gameName) => `${URL_SITE_PAGE}search/game/${gameName}/results?plats[268409]=1&search_type=advanced`;
const GAME_PAGE_HREF_SELECTOR = "#main_content > div.fxdrow.search_results_wrapper > div.module.search_results.fxdcol.gu6 > div.body > ul > " +
    " li > div > div.basic_stats.has_thumbnail > div > h3 > a";
const META_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.main_details > div > div > a > div > span`;
const USER_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.side_details > div:nth-child(1) > div > a > div`;
const pathFolder = path.resolve(`../`);
function getMetacriticScore() {
    try {
        let gamesAndFoldersNames = gatGamesAndFoldersNames();
        let gamesFoldersName = Object.keys(gamesAndFoldersNames);
        if (gamesFoldersName.length === 0 || !gamesFoldersName) {
            logger.error(`In games folder not have information`);
            return;
        }
        for (let i = 0; i < gamesFoldersName.length; i++) {
            let metacriticInfo;
            let metaScore;
            let userScore;
            let gameFolderName=gamesFoldersName[i];
            let gameName = gamesAndFoldersNames[gameFolderName];
            let searchGamePage = getSearchGamePage(gameName);
            let res = request('GET', encodeURI(searchGamePage), {});
            let htmlSearchPage = cheerio.load(res.body);
            let gamePageHref = htmlSearchPage(GAME_PAGE_HREF_SELECTOR).attr("href");
            if (gamePageHref) {
                gamePageHref = gamePageHref.slice(1);
                let gamePage = `${URL_SITE_PAGE}${gamePageHref}`;
                let gamePageRes = request('GET', encodeURI(gamePage), {});
                let htmlGamePage = cheerio.load(gamePageRes.body);
                let metaInfo = htmlGamePage(META_INFO_SELECTOR).text();
                let userInfo = htmlGamePage(USER_INFO_SELECTOR).text();
                if (metaInfo) {
                    logger.info(`Metascore on (${gameName}) has been successfully found: (${metaInfo})`)
                    metaScore = metaInfo;
                } else {
                    logger.error(`Metascore on game (${gameName}) not found.`)
                    metaScore = "NA";
                }
                if (!!userInfo && userInfo !== "tbd") {
                    logger.info(`User score on (${gameName}) has been successfully found: (${userInfo})`)
                    userScore = userInfo;
                } else {
                    logger.error(`User score on game (${gameName}) not found.`)
                    userScore = "NA";
                }
                metacriticInfo = {
                    "gameName": gameName,
                    "metaScore": metaScore,
                    "userScore": userScore,
                }
            } else {
                logger.error(`Game (${gameName}) not found.`)
                metacriticInfo = {
                    "gameName": gameName,
                    "error": "game not found"
                }
            }
            logger.info(`Creation metacriticInfo on game (${gameName}: ${metaScore};${userScore}) has been completed.`)
            let gameInfoPath = `${pathFolder}/games/${gameFolderName}/metacriticInfo.json`;
            fs.writeFileSync(gameInfoPath, JSON.stringify(metacriticInfo));
        }
    } catch (err) {
        logger.error("Technical error", err);
    }
}

getMetacriticScore()