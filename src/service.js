'use strict'

const migration = require('./migration')
const { DB, query, serialize } = require('./db')

class Service {
    constructor (data) {
        this.data = data
    }

    getParsedData() {
        const datas = this.data.trim().split(',')
        let parsedData = []
        for (const xData of datas) {
            if (!xData) continue
            const xDataSplit = xData.split(':')
            const name = xDataSplit[0]
            const value = xDataSplit[1]
            if (!name || !value) {
                console.log('ERR: ', `Invalid Name(${name}) or Value(${value})`)
                continue
            }
            parsedData.push({ name, value })
        }
        return parsedData
    }
}

class InstallService extends Service {
    async handle () {
        for (const {actionName, sql, test=[], alters=[]} of migration) {
            try {
                console.log('MIG:', 'Running', actionName)
                DB.serialize(() => {
                    let executes = DB.run(sql, [], (err) => (err) ? console.log(err) : '')
                    for (const alterSql of alters) {
                        console.log('MIG:', 'Running Alter', alterSql)
                        executes.run(alterSql, [], (err) => (err) ? console.log(err) : '')
                    }
                    for (const {sql: tSql, data} of test) {
                        console.log('MIG:', 'Running Test', tSql)
                        executes.run(tSql, data, (err) => (err) ? console.log(err) : '')
                    }
                })
            } catch (err) {
                console.log(err)
            }
        }
    }
}

class TrainService extends Service {
    async handle () {
        try {
            const validData = this.validate(this.getParsedData(this.data))
            for (const d of validData) {

            }
        } catch (err) {
            throw err
        }
    }

    validate(parsedData) {
        const validGenders = ['male', 'female']
        let validData = []
        for (const d of parsedData) {
            if (validGenders.indexOf(d.value) === -1) continue
            validData.push(d)
        }
        return validData
    }
}

class AnalyzeService extends Service {
    async handle () {
        try {
            // 
        } catch (err) {
            throw err
        }
    }
}

module.exports = { InstallService, TrainService, AnalyzeService }