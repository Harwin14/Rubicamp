var express = require('express');
var router = express.Router();


module.exports = () => {
  router.get('/', function (req, res, next) {
    res.render('login', { title: 'Express' });
  });

  router.post('/login', function (req, res, next) {
    res.redirect('/dashboard')
  });

  router.get('/logout', function (req, res, next) {
    res.redirect('/logout')
  });

  return router;
}