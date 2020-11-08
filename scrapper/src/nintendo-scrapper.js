const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const path = require('path');
const {gatGamesAndFoldersNames} = require("./utils/infoUtils");
const logger = require('./utils/logUtils').getLogger("nintendo-checker");
const pathFolder = path.resolve(`../`);

const START_PAGE = 'https://www.nintendo.com/games/game-guide/';
const puppeteer = require('puppeteer');


async function getPriceData(page) {
    return await page.$eval('#games-list-container > ul', ul => {
        let lis = ul.children;
        let li = lis[0];
        let newVar
        try {
            newVar = {
                price: li.querySelector('.b3.row-price > strong').innerHTML
            };
        } catch (e) {
            console.log(e)
        }
        return newVar
    });
}

let getGameInfo = async (gameName) => {
    const browser = await puppeteer.launch({'headless': false});
    const page = await browser.newPage();
    await page.goto(START_PAGE);
    await page.waitForSelector('#check-platform-Nintendo\\ Switch');
    await page.click('#check-platform-Nintendo\\ Switch');
    await page.waitForTimeout(3000);
    await page.click('#nclood-nav > div.top-nav-container.pin > div.top-nav > div > div.search-flex > button > span');
    await page.keyboard.type(gameName);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#games-list-container > ul');

    // await page.waitForTimeout(3000);

    let data = await getPriceData(page);
    await page.waitForSelector(`#games-list-container > ul > li:nth-child(1) > a > h3`);
    await page.click(`#games-list-container > ul > li:nth-child(1) > a > h3`);




    // await browser.close();
    return data;
};

async function getScreenshotFromNintendo() {
    try {
        let gamesAndFoldersNames = gatGamesAndFoldersNames();
        let gamesFoldersName = Object.keys(gamesAndFoldersNames);
        if (gamesFoldersName.length === 0 || !gamesFoldersName) {
            logger.error(`In games folder not have information`);
        }
        for (let i = 0; i < gamesFoldersName.length; i++) {
            let gameFolderName = gamesFoldersName[i];
            let gameName = gamesAndFoldersNames[gameFolderName];
            try {
                let gameInfo = await getGameInfo(gameName);
                gameInfo["name"] = gameName;
                let gameInfoPath = `${pathFolder}/games/${gameFolderName}/nintendoInfo.json`;
                fs.writeFileSync(gameInfoPath, JSON.stringify(gameInfoPath));
            } catch (err) {
                logger.error(`Game ${gameName} is not found.: ` + err);
                break;
            }
        }
    } catch (err) {
        logger.error(`Technical error` + err);
    }
}

getGameInfo('Bleed');