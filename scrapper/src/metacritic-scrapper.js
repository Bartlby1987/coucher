const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const path = require('path');
const {gatGamesNames} = require("./utils/infoUtils");
const URL_SITE_PAGE = `https://www.metacritic.com/`
const getSearchGamePage = (gameName) => `${URL_SITE_PAGE}search/game/${gameName}/results?plats[268409]=1&search_type=advanced`;
let GAME_PAGE_HREF_SELECTOR = "#main_content > div.fxdrow.search_results_wrapper > div.module.search_results.fxdcol.gu6 > div.body > ul > " +
    " li > div > div.basic_stats.has_thumbnail > div > h3 > a";
let META_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.main_details > div > div > a > div > span`;
let USER_INFO_SELECTOR = `div.summary_wrap > div.section.product_scores > div.details.side_details > div:nth-child(1) > div > a > div`;
const pathFolder = path.resolve(`../`);

function getMetacriticScore() {
    let gamesNames = gatGamesNames();
    for (let i = 0; i < gamesNames.length; i++) {
        let metacriticInfo;
        let metaScore;
        let userScore;
        let gameName = gamesNames[i];
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
                metaScore = metaInfo;
            } else {
                metaScore = "NA";
            }
            if (!!userInfo && userInfo !== "tbd") {
                userScore = userInfo;
            } else {
                userScore = "NA";
            }
            metacriticInfo = {
                "gameName": gameName,
                "metaScore": metaScore,
                "userScore": userScore,
            }
        } else {
            metacriticInfo = {
                "gameName": gameName,
                "error": "game not found"
            }
        }
        let gameInfoPath = `${pathFolder}/games/${gameName}/metacriticInfo.json`;
        fs.writeFileSync(gameInfoPath, JSON.stringify(metacriticInfo));
    }
}

getMetacriticScore()