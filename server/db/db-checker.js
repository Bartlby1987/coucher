const config = require('../config.json');
const shelljs = require("shelljs");
const sqlite3 = require('sqlite3').verbose();
const dbUtils = require('./db-utils');
const ddlScriptPath = "./db/ddl.sql";
const fs = require("fs");
const db = new sqlite3.Database('db.sqlite3');

function isFolderExists(gamesDataPath) {
    return shelljs.exec(`[ -d "${gamesDataPath}" ] && echo "true"`).stdout.trim() === 'true'
}

function isFileExists(gamesDataPath) {
    return shelljs.exec(`[ -f "${gamesDataPath}" ] && echo "true"`).stdout.trim() === 'true'
}

function logInfo(message) {
    console.log(message)
}

async function saveGameToDb(gameInfo) {
    let selectGameResult = await dbUtils.execAsync(db, `select * from GAMES where name = '${gameInfo.name}'`);

    if (selectGameResult.length !== 0) {
        logInfo('game already exists in db');
    } else {
        return dbUtils.execAsync(db, "INSERT INTO GAMES (NAME,GENRE,RELEASE_DATE) VALUES (?,?,?)",
            [gameInfo.name, gameInfo.genre, gameInfo.releaseDate])
    }

}

async function processGameFolder(gameFolder) {
    console.log(`processing game folder ${gameFolder}`)
    let gameInfoFileName = gameFolder + '/gameInfo.json';
    if (isFileExists(gameInfoFileName)) {
        console.log('gameInfo file has been found: ' + gameInfoFileName)

        let gameInfoFileContent = shelljs.cat(gameInfoFileName);
        let gameInfo = JSON.parse(gameInfoFileContent);

        // console.log(JSON.stringify(gameInfo))

        return saveGameToDb(gameInfo)

    } else {
        console.error(`gameInfo file not found: ${gameInfoFileName}`)
    }

}

async function initDb() {
    const requestTableListSql = fs.readFileSync(ddlScriptPath, "utf8");
    await execScript(requestTableListSql);
}

function execScript(sql) {
    db.exec(sql, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

let execute = async function () {
    let gamesDataPath = config.gamesDataPath;

    if (isFolderExists(gamesDataPath)) {
        console.log(`games folder '${gamesDataPath}' exists`)

        await initDb();

        let gamesFolderChildren = shelljs.ls(gamesDataPath);
        for (const gameFolderName of gamesFolderChildren) {
            await processGameFolder(gamesDataPath + "/" + gameFolderName)
        }
    } else {
        console.error(`games folder '${gamesDataPath}' is not exists`)
    }

}

// execute();