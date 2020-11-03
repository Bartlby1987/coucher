const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');
let logger = require('../utils/logUtils').getLogger("db");

global['db'] = db;

async function execAsync(sql, params) {
    if (logger.isDebugEnabled()) {
        logger.debug("sql query execution: " + sql + " | params: " + JSON.stringify(params))
    }

    params = params ? params : [];
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, result) => {
            if (error) {
                logger.error('error during async query execution: ' + error);
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

function execScript(sql) {
    db.exec(sql, (err) => {
        if (err) {
            logger.error('error during script execution: ' + err);
            throw err;
        }
    });
}


module.exports = {
    execAsync: execAsync,
    execScript: execScript
}