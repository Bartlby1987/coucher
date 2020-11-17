require('module-alias/register')

const shelljs = require("shelljs");
const fs = require("fs");

const {getGamesAndFoldersNames} = require("./utils/infoUtils");
const logUtils = require('./utils/logUtils');
const logger = logUtils.getLogger("nintendo-checker");
const {gamesFolderPath, skipAlreadyProcessed} = require('@src/utils/config');
const ndnFileName = 'nintendoInfo.json'

const GET_QUERY_PAGE = (query) => `https://www.nintendo.com/games/game-guide/#filter/:q=${query}&dFR[platform][0]=Nintendo%20Switch`;
const puppeteer = require('puppeteer');

async function execute() {
    try {
        let gamesAndFoldersNames = getGamesAndFoldersNames();
        if (gamesAndFoldersNames.length === 0) {
            logger.error('games folder is empty');
            return;
        } else {
            logger.info('total games amount: ' + gamesAndFoldersNames.length);
        }

        let counters = logUtils.createCounters();
        for (let gameInfo of gamesAndFoldersNames) {
            let ndnFilePath = `${gamesFolderPath}/${gameInfo.folderName}/${ndnFileName}`;
            if (skipAlreadyProcessed && isFileExists(ndnFilePath)) {
                logger.info(`game ${gameInfo.gameName} already processed: skipping...`)
                continue;
            }

            try {
                logger.info('getting info for ' + gameInfo.gameName)
                let ndnGameInfo = await getGameInfo(gameInfo, counters);
                logger.info('received game data for ' + gameInfo.gameName + ": " + JSON.stringify(ndnGameInfo))
                fs.writeFileSync(ndnFilePath, JSON.stringify(ndnGameInfo));

                let imageFolderPath = `${gamesFolderPath}/${gameInfo.folderName}/images`;

                if (ndnGameInfo.images && ndnGameInfo.images.length !== 0) {
                    shelljs.mkdir('-p', imageFolderPath)

                    for (let imgUrl of ndnGameInfo.images) {
                        shelljs.exec(`wget ${imgUrl} -P ${imageFolderPath}`)
                    }
                }


            } catch (e) {
                logger.error("error during processing " + gameInfo.gameName + " folder: " + e)
            }
        }
        logger.info(logUtils.formatTotalInfo(gamesAndFoldersNames.length, counters));

    } catch (err) {
        logger.error("technical error", err);
    }
}

let getGameInfo = async (gameInfo) => {
    const browser = await puppeteer.launch({'headless': true});
    try {
        const page = await browser.newPage();
        await page.goto(GET_QUERY_PAGE(encodeURI(gameInfo.gameName)));
        await page.waitForSelector('#games-list-container > ul');

        let data = {};
        data.price = await getPriceData(page);
        await page.waitForSelector(`#games-list-container > ul > li:nth-child(1) > a`);
        await page.waitForTimeout(1500);
        await page.click(`#games-list-container > ul > li:nth-child(1) > a > div > div > img`);

        await page.waitForTimeout(5000);
        await page.waitForTimeout(1000);

        try {
            data.images = await page.$eval('#gallery-component > product-gallery', root => {
                let imageItems = root.shadowRoot.querySelectorAll('product-gallery-item[type=image]');
                let imagesUrls = [];
                for (let imageItem of imageItems) {
                    imagesUrls.push(imageItem.shadowRoot.querySelector('img').src);
                }
                return imagesUrls
            })
        }catch (e) {
            logger.error("unable to get images: " + e)
        }

        console.log('images: ' + JSON.stringify(data.images))
        return data;
    } catch (e) {
        logger.error('error:' + e)
    } finally {
        await browser.close();
    }

};

async function getPriceData(page) {
    try {
        return await page.$eval('#games-list-container > ul', ul => {
            let lis = ul.children;
            let li = lis[0];

            return li.querySelector('.b3.row-price > strong').innerHTML
        });
    } catch (e) {
        console.log(e)
    }
}

(async () => {
    await execute()
})();

/*
(async () => {
    let gameInfo = await getGameInfo('Super Mario Odyssey');

    for (let imgUrl of gameInfo.images) {
        shelljs.exec(`wget ${imgUrl} -P /home/bartlby/IdeaProjects/coucher/scrapper/tmp/`)
    }

})();
*/

function isFileExists(gamesDataPath) {
    return shelljs.test(`-f`, gamesDataPath)
}