var express = require('express');
var router = express.Router();


module.exports = (db) => {
    router.get('/', async function (req, res, next) {
        try {
            const { rows } = await db.query('SELECT * FROM users')
            res.render('dashboard/user', {
                currentPage: 'dashboard',
                rows})
        } catch (e) {
            res.send(e)
        }

    });


    return router;
}