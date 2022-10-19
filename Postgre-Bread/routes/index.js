const moment = require('moment')
const express = require('express')
const router = express.Router()

module.exports = function (db) {
  router.get('/', (req, res) => {
    const page = req.query.page || 1
    const previous = parseInt(page) - 1
    const next = parseInt(page) + 1
    const limit = 3
    const offset = (page - 1) * limit
    const url = req.url == '/' ? '/?page=1' : req.url
   ` let sortBy = req.query.sortBy === undefined ? "id" : req.query.sortBy
    let order = req.query.order === undefined ? "asc" : req.query.order`
    //searching
    const params = []
    const values = []
    let counter = 1

    if (req.query.id && req.query.idFilters == 'on') {
      params.push(`id = $${counter++}`)
      console.log(req.query)
      values.push(req.query.id)
    }
    if (req.query.string && req.query.stringFilters == 'on') {
      params.push(`string ilike '%' || $${counter++} || '%'`)
      values.push(req.query.string)
    }
    if (req.query.integer && req.query.integerFilters == 'on') {
      // params.push(`integer like '%' || $${counter++} || '%'`)
      params.push(`integer = $${counter++}`)
      values.push(req.query.integer)
    }
    if (req.query.float && req.query.floatFilters == 'on') {
      // params.push(`float like '%' || $${counter++} || '%'`)
      params.push(`float = $${counter++}`)
      values.push(req.query.float)
    }
    if (req.query.dateFilters == 'on') {
      if (req.query.startDate != '' && req.query.endDate != '') {
        params.push(`date BETWEEN $${counter++}   AND $${counter++}`)
        values.push(req.query.startDate)
        values.push(req.query.endDate)
      } else if (req.query.startDate) {
        params.push(`date > $${counter++}`)
        values.push(req.query.startDate)
      } else {
        params.push(`date < $${counter++}`)
        values.push(req.query.endDate)
      }
    }
    if (req.query.boolean && req.query.booleanFilters == 'on') {
      params.push(`boolean = $${counter++}`)
      values.push(req.query.boolean)
    }

    let sql = 'SELECT COUNT(*) AS total FROM public."dataBreads"'
    if (params.length > 0)
      sql += ` WHERE ${params.join(' AND ')}`
    //console.log(sql)


    db.query(sql, values, (err, data) => {
      if (err) {
        console.error(err)
      }
      const pages = Math.ceil((data.rows[0].total) / limit)
      console.log(pages)

      sql = 'SELECT * FROM public."dataBreads"'
      if (params.length > 0)
        sql += ` WHERE ${params.join(' AND ')}`

      sql += ` ORDER BY ${sortBy} ${order} LIMIT $${counter++} OFFSET $${counter++}`

      console.log('sql', sql)
      db.query(sql, [...values, limit, offset], (err, data) => {
        if (err) {
          console.error(err)
        }
        res.render('index', { data: data.rows, pages, page, previous, next, query: req.query, moment, url, sortBy, order})  
      })
    })
  })

  //===========ADD==========\\
  router.get('/add', (req, res) => {   //displat form add
    res.render('add')


  })
  router.post('/add', (req, res) => {   //submit form
    db.query('INSERT INTO public."dataBreads" (string, integer, float, date, boolean) values ($1, $2, $3, $4, $5)',
      [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean], (err) => {
        if (err) {
          console.error(err)
        }
        res.redirect('/')
      })

    //===========EDIT==========\\

  })
  router.get('/edit/:id', (req, res) => {
    db.query('SELECT * FROM public."dataBreads" WHERE id = $1', [req.params.id], (err, data) => {
      if (err) {
        console.error(err)
      }
      res.render('edit', { item: data.rows[0], moment })
    })
  })
  router.post('/edit/:id', (req, res) => {
    db.query('UPDATE public."dataBreads" SET string = $1, integer = $2, float = $3, date = $4 , boolean = $5 WHERE id = $6',
      [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean, req.params.id], (err) => {
        if (err) {
          console.error(err)
        }
        res.redirect('/')
      })
  })

  //===========DELETE==========\\
  router.get('/delete/:id', (req, res) => {
    db.query('DELETE FROM public."dataBreads" WHERE id = $1', [req.params.id], (err, data) => {
      if (err) {
        console.error(err)
        throw err
      }
      res.redirect('/')
    })
  })
  return router;
}