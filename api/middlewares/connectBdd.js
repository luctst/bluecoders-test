const {MongoClient} = require("mongodb");

let client = null;
module.exports = function (options) {
  return async function connectBdd (req, res, next) {
    if (client) {
      res.locals.mongo = client;
      next();
    }

    try {
      client = await MongoClient.connect(process.env.DB_ACCESS, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      res.locals.mongo = client;
      next();
    } catch (error) {
      throw error
    }
  };
}
