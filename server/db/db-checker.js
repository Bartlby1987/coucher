const config = require('../config.json');
const shelljs = require("shelljs");
const sqlite3 = require('sqlite3').verbose();
const dbUtils = require('./db-utils');
const ddlScriptPath = "./db/ddl.sql";
const fs = require("fs");
const db = new sqlite3.Database('db.sqlite3');
const {logInfo, logError} =require('../utils/logUtils');
const {isFolderExists, isFileExists} =require('../utils/fileUtils');

global['db'] = db;

async function saveGameToDb(gameInfo) {
    let selectGameResult = await dbUtils.execAsync(`select * from GAMES where name = '${gameInfo.name}'`);

    if (selectGameResult.length !== 0) {
        logInfo(`game '${gameInfo.name}' already exists in db`);
    } else {
        return dbUtils.execAsync("INSERT INTO GAMES (NAME,GENRE,RELEASE_DATE) VALUES (?,?,?)",
            [gameInfo.name, gameInfo.genre, gameInfo.releaseDate])
    }
}

async function processGameFolder(gameFolder) {
    logInfo(`processing game folder ${gameFolder}`)
    let gameInfoFileName = gameFolder + '/gameInfo.json';
    if (isFileExists(gameInfoFileName)) {
        logInfo('gameInfo file has been found: ' + gameInfoFileName)

        let gameInfoFileContent = shelljs.cat(gameInfoFileName);
        logInfo(gameInfoFileContent.toString())
        let gameInfo = JSON.parse(gameInfoFileContent);

        return saveGameToDb(gameInfo)

    } else {
        logError(`gameInfo file not found: ${gameInfoFileName}`)
    }

}

async function initDb() {
    const requestTableListSql = fs.readFileSync(ddlScriptPath, "utf8");
    await dbUtils.execScript(requestTableListSql);
}


let execute = async function () {
    let gamesDataPath = config.gamesDataPath;

    if (isFolderExists(gamesDataPath)) {
        logInfo(`games folder '${gamesDataPath}' exists`)

        await initDb();

        let gamesFolderChildren = shelljs.ls(gamesDataPath);
        for (const gameFolderName of gamesFolderChildren) {
            try {
                await processGameFolder(gamesDataPath + "/" + gameFolderName)
            } catch (error) {
                logError(`error during processing ${gameFolderName} folder`)
            }
        }
    } else {
        logError(`games folder '${gamesDataPath}' is not exists`)
    }

}

execute();