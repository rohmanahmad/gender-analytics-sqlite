const currentDateFormatted = require('moment')().format('YYYY-MM-DD HH:mm:ss')

module.exports = [
    {
        actionName: 'Create Table "nama_per_kata"',
        sql: `CREATE TABLE IF NOT EXISTS nama_per_kata (name TEXT PRIMARY KEY)`,
        alters: [
            `ALTER TABLE nama_per_kata ADD COLUMN created_at DATE NOT NULL DEFAULT CURRENT_DATE`,
            `ALTER TABLE nama_per_kata ADD COLUMN updated_at DATE NULL`,
            `ALTER TABLE nama_per_kata ADD COLUMN gender TEXT NOT NULL DEFAULT ''`,
        ],
        test: [
            {
                sql: `INSERT INTO nama_per_kata(name, gender, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(name) DO UPDATE SET updated_at=?`,
                data: [ '__test', 'male', currentDateFormatted, null, currentDateFormatted ]
            }
        ]
    },
    {
        actionName: 'Create Table "analisa"',
        sql: `CREATE TABLE IF NOT EXISTS analisa(fullname TEXT PRIMARY KEY)`,
        alters: [
            `ALTER TABLE analisa ADD COLUMN created_at DATE NOT NULL DEFAULT CURRENT_DATE`,
            `ALTER TABLE analisa ADD COLUMN updated_at DATE NULL`,
            `ALTER TABLE analisa ADD COLUMN gender TEXT NOT NULL DEFAULT ''`,
        ],
        test: [
            {
                sql: "INSERT INTO analisa(fullname, gender, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(fullname) DO UPDATE SET updated_at=?",
                data: [ '__test', 'male', currentDateFormatted, null, currentDateFormatted ]
            }
        ]
    }
]