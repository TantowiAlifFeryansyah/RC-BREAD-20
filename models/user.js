const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const pathDB = path.join(__dirname, 'db', '../db/data.db')
const db = new sqlite3.Database(pathDB)

class User {

    static read() {
        db.all('SELECT * FROM Users', (err, data) =>{
            if(err) return console.log('gagal ambil data')
            // callback(data)
            console.log(data);
        })
    }
}

User.read()