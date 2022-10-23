var express = require('express');
var router = express.Router();

module.exports = function (db) {
  const collection = db.collection('breads')

  router.get('/', async function (req, res, next) {
    try {
      const findResult = await collection.find({}).toArray();
      res.status(200).json(findResult)
    } catch (e) {
      res.json(e)
    }
  });

  return router;
}