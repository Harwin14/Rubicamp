const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs');
const json = fs.readFileSync('database.json', 'utf-8')
const data = (JSON.parse(json))


const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/public', express.static(path.join(__dirname, "public")));


//----------BODY PARSER----------\\
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//----------END BP--------------\\

app.get('/', (req, res) => { res.render('index', { data }) })

//------------ADD------------\\
app.get('/add', (req, res) => { res.render('add') })
app.post('/add', (req, res) => {
  data.push({
    string: req.body.string,
    integer: req.body.integer,
    float: req.body.float,
    date: req.body.date,
    boolean: req.body.boolean
  })
  fs.writeFileSync('database.json', JSON.stringify(data, null, 3))
  res.redirect('/')
})

//------------DELETE----------\\
app.get('/delete/:id', (req, res) => {
  const id = req.params.id
  data.splice(id, 1)
  fs.writeFileSync('database.json', JSON.stringify(data, null, 3))
  res.redirect('/')
})

//-------------EDIT-------------\\
app.get('/edit/:id', (req, res) => {
  const id = req.params.id
  res.render('edit', { item: data[id], index: parseInt(req.params.id) })

})
app.post('/edit/:id', (req, res) => {
  const id = req.params.id
  data[id] = { string: req.body.string, integer: req.body.integer, float: req.body.float, date: req.body.date, boolean: req.body.boolean }
  fs.writeFileSync('database.json', JSON.stringify(data, null, 3))
  res.redirect('/')
})
app.listen(port, () => {
  console.log(`yok cek ! ${port}`)
})
// sudo kill -9 `sudo lsof -t -i:3000`