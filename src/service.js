'use strict'

const migration = require('./migration')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const DB = require('./db')
const flatten = require('lodash.flatten')
const dbName = 'gender-analytics.db'
const dbFile = path.resolve(`dbFiles/${dbName}`)

const cleanArray = function (str, splitter=',', filter) {
    let x = str.split(splitter).map(x => x.trim())
    if (filter) x = x.filter(filter)
    return x
}

class Service {
    constructor(data) {
        this.data = data
        this.db = new DB({ dbpath: dbFile })
    }

    getParsedData() {
        const datas = this.data.trim().split(',')
        let parsedData = []
        for (const xData of datas) {
            if (!xData) continue
            const xDataSplit = xData.split(':')
            const name = this.cleanName(xDataSplit[0])
            const value = xDataSplit[1]
            if (!name || !value) {
                console.log('ERR: ', `Invalid Name(${name}) or Value(${value})`)
                continue
            }
            parsedData.push({ name, value })
        }
        return parsedData
    }

    cleanName(strName='') {
        return strName
            .toLowerCase()
            .replace(/[^a-z']/gi, ' ')
    }

    tokenizeString(str) {
        return str
            .split(' ')
            .map(x => x.trim())
            .filter(x => x.length > 3)
    }
}

class InstallService extends Service {
    async handle() {
        try {

            if (fs.existsSync(dbFile)) fs.renameSync(dbFile, dbFile.replace(dbName, `db_${moment().format('YYYY-MM-DD_HH:mm:ss')}.backup`))
            this.db.connect()
            const dbCon = this.db.connection
            const dataToImport = this.readDataSource()
            for (const { actionName, sql, test = [], alters = [] } of migration) {
                try {
                    console.log('MIG:', 'Running', actionName)
                    dbCon.serialize(() => {
                        dbCon.run(sql, [], (err) => (err) ? console.log(err) : '')
                        for (const alterSql of alters) {
                            console.log('MIG:', 'Running Alter', alterSql)
                            dbCon.run(alterSql, [], (err) => (err) ? console.log(err) : '')
                        }
                        for (const { sql: tSql, data } of test) {
                            console.log('MIG:', 'Running Test', tSql)
                            dbCon.run(tSql, data, (err) => (err) ? console.log(err) : '')
                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }
            let i = 0
            for (const d of dataToImport) {
                const genderValue = d[1]
                for (const partName of this.tokenizeString(d[0])) {
                    i++
                    console.log(`[${i}][DB] UPDATE TO "nama_per_kata" [${partName}:${genderValue}]`)
                    dbCon.run(
                        'INSERT INTO nama_per_kata (name, created_at, gender) SELECT ?, ?, ? WHERE NOT EXISTS(SELECT 1 FROM nama_per_kata WHERE name = ?)',
                        [
                            partName,
                            moment().format('YYYY-MM-DD HH:mm:ss'),
                            genderValue,
                            partName
                        ]
                    )
                }
            }
        } catch (err) {
            throw err
        }
    }

    readDataSource() {
        const sourcePath = path.resolve('source.txt')
        const data = fs.readFileSync(sourcePath, {encoding: 'utf-8'})
        const parts = data.split('\n')
        return parts.map(x => x.split(',').map(x => x.trim()))
    }
}

class TrainService extends Service {
    async handle() {
        try {
            this.db.connect()
            const dbCon = this.db.connection
            const validData = this.validate(this.getParsedData(this.data))
            for (const { name, value } of validData) {
                for (const partName of name) {
                    console.log(`[DB] UPDATE TO "nama_per_kata" [${partName}:${value}]`)
                    dbCon.run(
                        'INSERT INTO nama_per_kata (name, created_at, gender) SELECT ?, ?, ? WHERE NOT EXISTS(SELECT 1 FROM nama_per_kata WHERE name = ?)',
                        [
                            partName,
                            moment().format('YYYY-MM-DD HH:mm:ss'),
                            value,
                            partName
                        ]
                    )
                }
            }
        } catch (err) {
            throw err
        }
    }

    validate(parsedData) {
        const validGenders = ['male', 'female']
        let validData = []
        for (const d of parsedData) {
            if (validGenders.indexOf(d.value.toLowerCase()) === -1) continue
            validData.push({name: this.tokenizeString(d.name), value: d.value})
        }
        return validData
    }
}

class AnalyzeService extends Service {
    async handle() {
        try {
            this.db.connect()
            const splitData = cleanArray(this.data.toUpperCase()).map(x => cleanArray(x, ' ', (n => n.length > 1))).filter(x => x.length > 0)
            const deepArray = flatten(splitData)
            const q = deepArray.map(x => 'name=?').join(' OR ')
            const data = await this.getData('SELECT name, gender FROM nama_per_kata WHERE ' + q, deepArray)
            if (data && data.length > 0) {
                const obj = data.reduce((r, x) => {
                    r[x.name] = x
                    return r
                }, {})
                for (const arrName of splitData) {
                    const name = arrName.join(' ')
                    console.log('Analyzing Name', name, '...')
                    const result = {f: 0, m: 0}
                    for (const namePerkata of arrName) {
                        let gender = 'not-found'
                        const r = obj[namePerkata]
                        if (r) {
                            gender = r.gender
                            if (gender.toLowerCase() === 'male') result['m'] += 1
                            else result['f'] += 1
                        }
                        console.log(' -', namePerkata, `(${gender})`)
                    }
                    const percentage = this.getPercentage(result)
                    console.log('Conclusion:', name, 'is', this.getDominan(result, percentage))
                }
            }
        } catch (err) {
            throw err
        }
    }

    getPercentage({f, m}) {
        const total = f + m
        const percentageOfFemale = Math.ceil(f / total * 100)
        const percentageOfMale = Math.ceil(m / total * 100)
        return {
            f: percentageOfFemale,
            m: percentageOfMale
        }
    }

    getDominan({f, m}, percentage) {
        let conclusion = 'bingung'
        if (f > m) conclusion = 'female' + ` (${percentage['f']}%)`
        else if (f < m) conclusion = 'male' + ` (${percentage['m']}%)`
        else if (f == m) conclusion = 'female' + ` (${percentage['f']}%)`
        return conclusion
    }

    async getData (sql, data) {
        return new Promise((resolve, reject) => {
            const dbCon = this.db.connection
            dbCon.all(
                sql,
                data,
                (err, row) => {
                    if (err) reject(err)
                    else resolve(row)
                })
        })
    }
}

module.exports = { InstallService, TrainService, AnalyzeService }