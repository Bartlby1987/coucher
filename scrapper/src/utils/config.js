let config = require('@root/config.json');
const path = require('path');

const gamesFolderPath = path.resolve('..' ,config['gamesFolderPath']);


module.exports = Object.assign({}, config);
module.exports.gamesFolderPath = gamesFolderPath;