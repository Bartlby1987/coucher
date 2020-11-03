let db = require('../db/db-utils');
let logger = require('../utils/logUtils').getLogger("games.provider");

let availableColumns;

const queryGames = async (request) => {

    if (!availableColumns) {
        availableColumns = await getAvailableColumns();
    }

    let ordering = '';
    if (request.sorting && request.sorting.column && request.sorting.direction) {
        if (!availableColumns.has(request.sorting.column)) {
            let message = `column ${request.sorting.column} is not permitted`;
            logger.error(message)
            throw message;
        }

        ordering = ` ORDER BY ${request.sorting.column} ${request.sorting.direction} `
    }

    let result = await db.execAsync("SELECT * FROM GAMES " + ordering + ` LIMIT ? OFFSET ?`, [request.limit, request.offset])

    return result.map(game => {
        return {
            name: game.NAME,
            genre: game.GENRE,
            releaseDate: game.RELEASE_DATE,
            splitScreen: game.SPLIT_SCREEN === 1,
            players: game.COUCH_PLAYERS
        }
    });
}

const getAvailableColumns = async () => {

    let gamesTableInfo = await db.execAsync("PRAGMA table_info('GAMES')");
    return new Set(gamesTableInfo
    .filter(row => row.name !== 'ID')
    .map(row => row.name));

}

module.exports = {
    queryGames: queryGames
}
