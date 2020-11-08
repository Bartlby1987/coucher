const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const path = require('path');
const {gatGamesAndFoldersNames} = require("./utils/infoUtils");
const logger = require('./utils/logUtils').getLogger("nintendo-checker");
const pathFolder = path.resolve(`../`);
const shelljs = require("shelljs");

const GET_QUERY_PAGE = (query) => `https://www.nintendo.com/games/game-guide/#filter/:q=${query}&dFR[platform][0]=Nintendo%20Switch`;
const puppeteer = require('puppeteer');


let getGameInfo = async (gameName) => {
    const browser = await puppeteer.launch({'headless': false});
    const page = await browser.newPage();
    await page.goto(GET_QUERY_PAGE(encodeURI(gameName)));
    await page.waitForSelector('#games-list-container > ul');

    // await page.waitForTimeout(3000);

    let data = await getPriceData(page);
    await page.waitForSelector(`#games-list-container > ul > li:nth-child(1) > a`);
    await page.waitForTimeout(1500);
    await page.click(`#games-list-container > ul > li:nth-child(1) > a > div > div > img`);


    await page.waitForTimeout(5000);
    // await page.click(`div > div.glide__track > ul`);
    await page.focus('#add-to-wishlist > styled-button > span');
    await page.focus('#add-to-wishlist');
    // await page.focus('product-gallery');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);

    await page.waitForSelector('.pswp__counter');

    let imageCounter = await page.$eval('.pswp__counter', div => div.innerText);
    let imageUrl = await page.$eval('.pswp__img', img => img.src);

    console.log('image counter: ' + imageCounter)

    let imageAmount = imageCounter.trim().split(' / ')[1]
    console.log('image amount: ' + imageAmount)

    console.log('fetched image url: ' + imageUrl)

    data.images = []
    for (let i = 1; i <= imageAmount; i++) {
        let indexRepresentation = i >= 10 ? i : '0' + i
        let url = imageUrl.replace(/screenshot\d+\./, `screenshot${indexRepresentation}.`);
        console.log('generated image url: ' + url)
        data.images.push(url)
    }

    await browser.close();
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

(async ()=> {
    let gameInfo = await getGameInfo('Super Mario Odyssey');

    for (let imgUrl of gameInfo.images) {
        shelljs.exec(`wget ${imgUrl} -P /home/bartlby/IdeaProjects/coucher/scrapper/tmp/`)
    }


})();
