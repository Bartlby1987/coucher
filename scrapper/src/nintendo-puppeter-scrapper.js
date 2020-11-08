
const START_PAGE = 'https://www.nintendo.com/games/game-guide/';

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({'headless': false});
    const page = await browser.newPage();
    await page.goto(START_PAGE);

    await page.click('#nclood-nav > div.top-nav-container.pin > div.top-nav > div > div.search-flex > button > span')

    await page.keyboard.type('mario')
    await page.keyboard.press('Enter')

    await page.waitForSelector('#games-list-container > ul');

    await timeout(5000)
    await page.click('#check-platform-Nintendo\\ Switch')
    await timeout(3000)

    // console.log('run')
    let data = await page.$eval('#games-list-container > ul', ul => {
        // console.log('ul: '+ JSON.stringify(ul));
        let lis = ul.children;
        // console.log('lis: '+ JSON.stringify(lis));
        let dataArray = []
        // for (let li of lis) {
            try {
                // console.log('li: ' + JSON.stringify(li));
                // console.log('li iiner: ' + JSON.stringify(li.innerHTML));
                let newVar = {
                    url: lis[0].querySelector("a").href,
                    name: lis[0].querySelector('.b3').innerText,
                    price: lis[0].querySelector('.b3.row-price > strong').innerHTML,
                    system: lis[0].querySelector('p.b4[data-system]').innerHTML
                    // url: li.querySelector("a").href,
                    // name: li.querySelector('.b3').innerText,
                    // price: li.querySelector('.b3.row-price > strong').innerHTML,
                    // system: li.querySelector('p.b4[data-system]').innerHTML
                };
                dataArray.push(newVar)
            } catch (e) {
                console.log(e)
            }

        // }
        return dataArray
    });
    await timeout(5000);
    await page.click(`#games-list-container > ul > li:nth-child(1) > a`)




    // await browser.close();
    console.log(JSON.stringify(data))
})();

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}