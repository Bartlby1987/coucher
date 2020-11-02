
async function execAsync(db, sql, params) {
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

module.exports = {
    execAsync: execAsync
}