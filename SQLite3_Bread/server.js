const express = require('express')
const moment = require('moment')
const app = express()
var bodyParser = require('body-parser') /*ada pilihan pake JSON di web npm*/
const path = require('path')
const port = 3000

//---------------------sqlite-------------------//
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE)
//-------------------end------------------//

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') 
app.use('/public', express.static(path.join(__dirname, 'public')))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


//----------list Filter dan Pagenation----------\\
app.get('/', (req, res) => { 
  const page = req.query.page || 1
  const previous = parseInt(page) - 1
  const next = parseInt(page) + 1
  const limit = 3
  const offset = (page - 1) * limit
  const url = req.url == '/' ? '/?page=1' : req.url

  //searching
  const params = []
  const values = []
  let counter = 1

  if (req.query.id && req.query.idFilters == 'on') {
    params.push(`id = $${counter++}`)
    values.push(req.query.id)
  }
  if (req.query.string && req.query.stringFilters == 'on') {
    params.push(`string like '%' || $${counter++} || '%'`)
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
      params.push('date BETWEEN ? AND ?')
      values.push(req.query.startDate)
      values.push(req.query.endDate)
    } else if (req.query.startDate) {
      params.push('date > ?')
      values.push(req.query.startDate)
    } else {
      params.push('date < ?')
      values.push(req.query.endDate)
    }
  }
  if (req.query.boolean && req.query.booleanFilters == 'on') {
    params.push(`boolean = $${counter++}`)
    values.push(req.query.boolean)
  }

  let sql = 'SELECT COUNT(*) AS total FROM data'
  if (params.length > 0)
    sql += ` WHERE ${params.join(' AND ')}`
  //console.log(sql)

  db.all(sql, values, (err, data) => {
    if (err) return res.send(err)
    const pages = Math.ceil(parseInt(data[0].total) / limit)

    sql = "SELECT * FROM data"
    if (params.length > 0)
      sql += ` WHERE ${params.join(' AND ')}`

    sql += ` LIMIT $${counter++} OFFSET $${counter++}`

    db.all(sql, [...values, limit, offset], (err, data) => {
      if (err) {
        console.log('Failed to read')
        throw err;
      }
      res.render('index', { rows: data, moment, data, page, pages, previous, next, query: req.query, url })   /* res render = menerima dari file */
    })
  })
})

//-------------ADD----------\\
app.get('/add', (req, res) => { /* /...adalah router */
  res.render('add')   /* res render = menampilkan form */
})

app.post('/add', (req, res) => { /* /...adalah router */
  const addData = 'INSERT INTO data (string, integer, float, date, boolean) values (?,?,?,?,?)'
  db.get(addData, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
    if (err) {
      console.log('Failed to add')
      throw err;
    }
    res.redirect('/')
  })
})


//---------------EDIT-------------\\
app.get('/edit/:id', (req, res) => {
  const selectData = 'SELECT * FROM data WHERE id = ?'
  const index = parseInt(req.params.id)
  db.get(selectData, [index], (err, item) => {
    if (err) {
      console.log('Failed to read')
      throw err;
    }
  //  console.log(item)
    res.render('edit', { item, index })   /* res render = menerima dari file */
  })
})

app.post('/edit/:id', (req, res) => {
  const index = req.params.id
  const editData = 'UPDATE data set string=?, integer=?, float=?, date=?, boolean=? where id = ?'
  db.run(editData, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, index], (err) => {
    if (err) {
      console.log('Failed to add')
      throw err;
    }
    res.redirect('/')
  })
})
//-------------DELETE-----------\\
app.get('/delete/:id', (req, res) => {
  const index = parseInt(req.params.id)
  const deleteData = 'DELETE FROM data WHERE id = ?'
  db.run(deleteData, [index], (err) => {
    if (err) {
      {
        console.log('Failed to delete')
        throw err
      }
    }
  })
  res.redirect('/')
})


app.listen(port, () => {
  console.log(`cek cek ${port}`)
})