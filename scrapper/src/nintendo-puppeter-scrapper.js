const cheerio = require('cheerio');
const request = require('sync-request');
const fs = require("fs");
const path = require('path');
const logger = require('./utils/logUtils').getLogger("ndn-puppeter-scrapper");

const START_PAGE = 'https://www.nintendo.com/games/game-guide/';

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({'headless': false});
    const page = await browser.newPage();
    await page.goto(START_PAGE);

    let handle = await page.waitForSelector(
        '#nclood-nav > div.top-nav-container.pin > div.top-nav > div > div.search-flex > button > span');

    await page.click('#nclood-nav > div.top-nav-container.pin > div.top-nav > div > div.search-flex > button > span')

    await page.keyboard.type('20XX')
    await page.keyboard.press('Enter')

    await page.waitForSelector('#games-list-container > ul');

    // let ulEl = await page.$eval('#games-list-container > ul > li', u => u.outerHTML);

    console.log('run')
    let data = await page.$eval('#games-list-container > ul', ul => {
        console.log('ul: '+ JSON.stringify(ul));
        let lis = ul.children;
        console.log('lis: '+ JSON.stringify(lis));
        let dataArray = []
        for (let li of lis) {
            try {
                console.log('li: ' + JSON.stringify(li));
                console.log('li iiner: ' + JSON.stringify(li.innerHTML));
                let newVar = {
                    url: li.querySelector("a").href,
                    name: li.querySelector('.b3').innerText,
                    price: li.querySelector('.b3.row-price > strong').innerHTML,
                    system: li.querySelector('p.b4[data-system]').innerHTML
                };
                dataArray.push(newVar)
            } catch (e) {
                console.log(e)
            }

        }
        return dataArray
    });

    // await browser.close();
    console.log(JSON.stringify(data))
})();