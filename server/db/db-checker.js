const config = require('../config.json');
const shelljs = require("shelljs");
const dbUtils = require('./db-utils');
const ddlScriptPath = "./db/ddl.sql";
const fs = require("fs");
const logger = require('../utils/logUtils').getLogger("db-checker");
const {isFolderExists, isFileExists} = require('../utils/fileUtils');

const GAME_INFO_FILENAME = 'gameInfo.json';

function isSplitScreen(features) {
    return features.some(feature => feature.toLowerCase().includes('split-screen'))
}

exports.execute = async function () {
    logger.info('game data loading...')

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

async function processGameFolder(gameFolder) {
    logger.info(`processing game folder ${gameFolder}`)
    let gameInfoFileName = gameFolder + '/' + GAME_INFO_FILENAME;

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

async function saveGameToDb(gameInfo) {
    let selectGameResult = await dbUtils.execAsync(`select * from GAMES where name = ?`, [gameInfo.gameName]);

    if (selectGameResult.length !== 0) {
        logger.info(`game '${gameInfo.gameName}' already exists in db`);
    } else {

        let splitScreen = isSplitScreen(gameInfo.features);

        return dbUtils.execAsync(
            "INSERT INTO GAMES (NAME,GENRE,RELEASE_DATE, COUCH_PLAYERS, SPLIT_SCREEN) VALUES (?,?,?,?,?)",
            [gameInfo.gameName, gameInfo.genre, gameInfo.releaseDate, gameInfo.couch, splitScreen])
    }
}

