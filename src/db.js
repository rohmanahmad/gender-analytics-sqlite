'use strict'

const sqlite3 = require('sqlite3').verbose()

class DB {
  constructor({ dbpath }) {
    this.dbpath = dbpath
    this.connection = null
  }

  connect() {
    if (!this.connection) {
      this.connection = new sqlite3.Database(this.dbpath, (err) => {
        if (err) {
          console.error(err.message)
        }
        // console.log('DB Connected!');
      })
    }
  }
}

module.exports = DB