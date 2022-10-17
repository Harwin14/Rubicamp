const express = require('express')
const path = require('path')
var bodyParser = require('body-parser')

const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/add', (req, res) => {
  res.render('add')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
