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

    const params = [];
    const values = [];

    if (req.query.id && req.query.idcheck) {
        params.push(`ID = ?`)
        values.push(req.query.id)
    }

    if (req.query.string && req.query.stringcheck) {
        params.push(`stringNama = ?`)
        values.push(req.query.string)
    }

    if (req.query.integer && req.query.integercheck) {
        params.push(`integerAngka = ?`)
        values.push(Number(req.query.integer))
    }

    if (req.query.float && req.query.floatcheck) {
        params.push(`floatAngka = ?`)
        values.push(parseFloat(req.query.float))
    }

    if (req.query.datecheck) {
        if (req.query.startdate != '' && req.query.enddate != '') {
            params.push(`tanggalDate BETWEEN ? AND ?`)
            values.push(req.query.startdate)
            values.push(req.query.enddate)
        }
        else if (req.query.startdate != '') {
            params.push(`tanggalDate >= ?`)
            values.push(req.query.startdate)
        }
        else if (req.query.enddate != '') {
            params.push(`tanggalDate <= ?`)
            values.push(req.query.enddate)
        }
    }

    if (req.query.boolean && req.query.booleancheck) {
        params.push(`booleanBoolean = ?`)
        values.push(JSON.parse(req.query.boolean))
    }

    const page = req.query.page || 1
    const limit = 3;
    const offset = (page - 1) * limit

    let sql = `SELECT count(*) As total from Users `
    if (params.length > 0)
        sql += `WHERE ${params.join(' AND ')}`

    db.all(sql, values, (err, data) => {
        if (err) return console.log('gagal hitung data', err);
        const total = data[0].total
        const totalPages = Math.ceil(total / limit)

        sql = `SELECT * FROM Users `
        if (params.length > 0)
            sql += `WHERE ${params.join(' AND ')}`

        sql += `LIMIT ? offset ?`
        db.all(sql, [...values, limit, offset], (err, rows) => {
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
    if (boolean) {
        db.run(`INSERT INTO Users (stringNama, integerAngka, floatAngka, tanggalDate, booleanBoolean) VALUES (?,?,?,?,?)`, [string, parseFloat(float), Number(integer), date, JSON.parse(boolean)], (err) => {
            if (err) return console.log('gagal ambil data', err);
            res.redirect('/')
        })
    } else {
        db.run(`INSERT INTO Users (stringNama, integerAngka, floatAngka, tanggalDate) VALUES (?,?,?,?)`, [string, parseFloat(float), Number(integer), date], (err) => {
            if (err) return console.log('gagal ambil data', err);
            res.redirect('/')
        })
    }
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