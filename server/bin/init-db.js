const dbChecker = require("../db/db-checker");

(async () => await dbChecker.execute())();