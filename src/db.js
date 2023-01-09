'use strict'

const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const dbFile = path.resolve('dbFiles/gender-analytics.db')

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  })

module.exports = {
    query: db.run,
    DB: db,
    serialize: db.serialize
}