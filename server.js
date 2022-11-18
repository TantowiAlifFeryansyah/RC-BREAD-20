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

// app.get('/', (req, res) => {
//     db.all(`SELECT * FROM Users`, (err, rows) => {
//         if (err) return console.log('gagal ambil data', err);
//         res.render('index', { dataUser: rows, moment })
//     })
// })

app.get('/', (req, res) => {
    const page = req.query.page || 1
    const limit = 3;
    // const offset = 0
    const offset = (page - 1) * limit

    db.all(`SELECT count(*) As total from Users`, (err, data) => {
        if (err) return console.log('gagal hitung data', err);
        const total = data[0].total
        const totalPages = Math.ceil(total / limit)
        // console.log(totalPages);
        db.all(`SELECT * FROM Users LIMIT ? offset ?`, [limit, offset], (err, rows) => {
            if (err) return console.log('gagal ambil data', err);
            res.render('index', { dataUser: rows, page, moment, totalPages })
        })
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
    db.all(`SELECT * FROM Users WHERE ID = ?`, [index], (err, rows) => {
        if (err) return console.log('gagal ambil data', err);
        rows.forEach((item) => {
            res.render('edit', { item })
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




app.listen(port, () => {
    console.log(`Aplikasi akan berjalan di port ${port}`)
})