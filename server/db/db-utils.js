
async function execAsync(sql, params) {
    params = params ? params : [];
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, result) => {
            if (error) {
                console.error(error);
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
            logError(err);
            throw err;
        }
    });
}


module.exports = {
    execAsync: execAsync,
    execScript: execScript
}