var express = require('express');
const logger = require('../utils/logUtils').getLogger("router.games")
var router = express.Router();
const gamesProvider = require('../games/games.provider')


const availableDirection = new Set(['ASC', "DESC"])

router.get('/list', async function(req, res, next) {
  try {
    let limit = Number(req.query.limit | 25);
    let offset = Number(req.query.offset | 0);
    let sortColumn = req.query.sortColumn | 'name';
    let sortDirection = availableDirection.has(req.query.sortDirection) ? req.query.sortDirection : "ASC";

    //todo: filters

    let gamesList = await gamesProvider.queryGames({
      limit: limit,
      offset: offset,
      sorting: {
        column: sortColumn,
        direction: sortDirection
      }
    });

    res.send(gamesList);
  } catch (error) {
    logger.error('error during getting games list: ' + error)
    res.status(500)
    res.send('unexpected error')
  }
});

module.exports = router;
