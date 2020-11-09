require('module-alias/register')

const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");

const {getGamesAndFoldersNames} = require("./utils/infoUtils");
const logUtils = require('./utils/logUtils');
const logger = logUtils.getLogger("metacritic-checker");
const gamesFolderPath = require('@src/utils/config').gamesFolderPath;

const URL_SITE_PAGE = `https://www.metacritic.com/`;
const GAME_PAGE_HREF_SELECTOR = "#main_content > div.fxdrow.search_results_wrapper > div.module.search_results.fxdcol.gu6 > div.body > ul > " +
    " li > div > div.basic_stats.has_thumbnail > div > h3 > a";
const META_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.main_details > div > div > a > div > span`;
const USER_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.side_details > div:nth-child(1) > div > a > div`;
const NOT_AVAILABLE = "NA";
const getSearchGamePage = (gameName) => `${URL_SITE_PAGE}search/game/${gameName}/results?plats[268409]=1&search_type=advanced`;



function getMetacriticScore() {
    try {
        let gamesAndFoldersNames = getGamesAndFoldersNames();
        if (gamesAndFoldersNames.length === 0) {
            logger.error('games folder is empty');
            return;
        }
        let counters = logUtils.createCounters();
        for (let gameInfo of gamesAndFoldersNames) {
            try {
                processGame(gameInfo, counters);
            } catch (e) {
                logger.error("error during processing " + gameInfo + " folder: " + e)
            }
        }
        logger.info(logUtils.formatTotalInfo(gamesAndFoldersNames.length, counters));
    } catch (err) {
        logger.error("technical error", err);
    }
}


function processGame(gameInfo, counters) {
    let gameName = gameInfo.gameName;
    let gameFolderName = gameInfo.folderName;

    let metacriticInfo = {};
    metacriticInfo.gameName = gameName;

    let searchGamePage = getSearchGamePage(gameName);
    let res = request('GET', encodeURI(searchGamePage), {});
    let htmlSearchPage = cheerio.load(res.body);
    let gamePageHref = htmlSearchPage(GAME_PAGE_HREF_SELECTOR).attr("href");

    if (gamePageHref) {
        gamePageHref = gamePageHref.slice(1);
        let gamePage = `${URL_SITE_PAGE}${gamePageHref}`;
        let gamePageRes = request('GET', encodeURI(gamePage), {});
        let htmlGamePage = cheerio.load(gamePageRes.body);

        gameName.metaScore = getMetaScore(htmlGamePage, counters, gameName);
        gameName.userScore = getUserScore(htmlGamePage, counters, gameName);
    } else {
        logger.error(`Game (${gameName}) not found.`);
        counters.notFoundGame++
        metacriticInfo.error = "game not found";
    }
    logger.info(`Creation metacriticInfo on game (${gameName}: has been completed: ` + JSON.stringify(metacriticInfo))
    let gameInfoPath = `${gamesFolderPath}/${gameFolderName}/metacriticInfo.json`;
    fs.writeFileSync(gameInfoPath, JSON.stringify(metacriticInfo));
}

function getMetaScore(htmlGamePage, counters, gameName) {
    let metaInfo = htmlGamePage(META_INFO_SELECTOR).text();

    let metaScore;
    if (metaInfo) {
        counters.metaScoreFound++;
        logger.info(`Metascore on (${gameName}) has been successfully found: (${metaInfo})`)
        metaScore = metaInfo;
    } else {
        counters.metaScoreNotFound++;
        logger.error(`Metascore on game (${gameName}) not found.`)
        metaScore = NOT_AVAILABLE;
    }
    return metaScore;
}

function getUserScore(htmlGamePage, counters, gameName) {
    let userInfo = htmlGamePage(USER_INFO_SELECTOR).text();

    if (!!userInfo && userInfo !== "tbd") {
        counters.userScoreFound++;
        logger.info(`User score on (${gameName}) has been successfully found: (${userInfo})`)
        return userInfo;
    } else {
        counters.userScoreNotFound++;
        logger.error(`User score on game (${gameName}) not found.`)
        return NOT_AVAILABLE;
    }
}

getMetacriticScore()
