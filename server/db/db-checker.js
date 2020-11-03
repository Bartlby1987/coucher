const config = require('../config.json');
const shelljs = require("shelljs");
const sqlite3 = require('sqlite3').verbose();
const dbUtils = require('./db-utils');
const ddlScriptPath = "./db/ddl.sql";
const fs = require("fs");
const db = new sqlite3.Database('db.sqlite3');
const logger =require('../utils/logUtils').getLogger("db-checker");
const {isFolderExists, isFileExists} =require('../utils/fileUtils');

global['db'] = db;

function isSplitScreen(features) {
    return features.some(feature => feature.toLowerCase().includes('split-screen'))
}

async function saveGameToDb(gameInfo) {
    let selectGameResult = await dbUtils.execAsync(`select * from GAMES where name = '${gameInfo.game}'`);

    if (selectGameResult.length !== 0) {
        logger.info(`game '${gameInfo.game}' already exists in db`);
    } else {

        let splitScreen = isSplitScreen(gameInfo.features);

        return dbUtils.execAsync("INSERT INTO GAMES (NAME,GENRE,RELEASE_DATE, COUCH_PLAYERS, SPLIT_SCREEN) VALUES (?,?,?,?,?)",
            [gameInfo.game, gameInfo.genre, gameInfo.releaseDate, gameInfo.couch, splitScreen])
    }
}

async function processGameFolder(gameFolder) {
    logger.info(`processing game folder ${gameFolder}`)
    let gameInfoFileName = gameFolder + '/gameInfo.json';
    if (isFileExists(gameInfoFileName)) {
        logger.info('gameInfo file has been found: ' + gameInfoFileName)

        let gameInfoFileContent = shelljs.cat(gameInfoFileName);
        logger.info(gameInfoFileContent.toString())
        let gameInfo = JSON.parse(gameInfoFileContent);

        return saveGameToDb(gameInfo)

    } else {
        logger.error(`gameInfo file not found: ${gameInfoFileName}`)
    }

}

async function initDb() {
    const requestTableListSql = fs.readFileSync(ddlScriptPath, "utf8");
    await dbUtils.execScript(requestTableListSql);
}


let execute = async function () {
    let gamesDataPath = config.gamesDataPath;

    if (isFolderExists(gamesDataPath)) {
        logger.info(`games folder '${gamesDataPath}' exists`)

        await initDb();

        let gamesFolderChildren = shelljs.ls(gamesDataPath);
        for (const gameFolderName of gamesFolderChildren) {
            try {
                await processGameFolder(gamesDataPath + "/" + gameFolderName)
            } catch (error) {
                logger.error(`error during processing ${gameFolderName} folder`)
            }
        }
    } else {
        logger.error(`games folder '${gamesDataPath}' is not exists`)
    }

}

execute();