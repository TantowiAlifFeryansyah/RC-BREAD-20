const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const port = 3005
var moment = require('moment')

const sqlite3 = require('sqlite3').verbose();
const pathDB = path.join(__dirname, 'db', 'data.db')
const db = new sqlite3.Database(pathDB)

const app = express()

const data = []

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//template engine
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    db.all(`SELECT * FROM Users`, (err, rows) => {
        if (err) return console.log('gagal ambil data', err);
        res.render('index', { dataUser: rows, moment })
    })
})

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    const { string, integer, float, date, boolean } = req.body
    db.run(`INSERT INTO Users (stringNama, integerAngka, floatAngka, tanggalDate, booleanBoolean) VALUES (?,?,?,?,?)`, [string, parseFloat(float), Number(integer), date, JSON.parse(boolean)], (err) => {
        if (err) return console.log('gagal ambil data', err);
        res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    const index = req.params.id
    db.all(`Delete FROM Users WHERE ID = ?`, [index], (err, rows) => {
        if (err) return console.log('gagal ambil data', err);
        res.redirect('/')
    })
})

app.get('/edit/:id', (req, res) => {
    const index = req.params.id
    db.all(`SELECT * FROM Users WHERE ID = ?`,[index],(err, rows) => {
        if (err) return console.log('gagal ambil data', err);
        rows.forEach((item) => {
            res.render('edit', {item})
            // console.log(item);
        })
    })
})

app.post('/edit/:id', (req, res) => {
    const index = req.params.id
    const { string, integer, float, date, boolean } = req.body
    db.run(`UPDATE Users SET stringNama = ?, integerAngka = ?, floatAngka = ?, tanggalDate = ?, booleanBoolean = ? WHERE ID = ?`, [string, parseFloat(float), Number(integer), date, JSON.parse(boolean), index], (err) => {
        if (err) return console.log('gagal ambil data', err);
        res.redirect('/')
    })
})

// app.post('/edit/:id', (req, res) => {
//     const index = req.params.id
//     data[index] = {string: req.body.string, integer: Number(req.body.integer), float: parseFloat(req.body.float), date: req.body.date, boolean: JSON.parse(req.body.boolean) }
//     res.redirect('/')
// })


app.listen(port, () => {
    console.log(`Aplikasi akan berjalan di port ${port}`)
})