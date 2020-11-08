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

    let data = await getPriceData(page);
    await page.waitForSelector(`#games-list-container > ul > li:nth-child(1) > a`);
    await page.waitForTimeout(1500);
    await page.click(`#games-list-container > ul > li:nth-child(1) > a > div > div > img`);

    await page.waitForTimeout(5000);
    await page.waitForTimeout(1000);

    data.images = await page.$eval('#gallery-component > product-gallery', root => {
        let imageItems = root.shadowRoot.querySelectorAll('product-gallery-item[type=image]');
        let imagesUrls = [];
        for (let imageItem of imageItems) {
            imagesUrls.push(imageItem.shadowRoot.querySelector('img').src);
        }
        return imagesUrls
    })

    console.log('images: ' + JSON.stringify(data.images))

    await browser.close();
    return data;
};

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
