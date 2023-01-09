'use strict'

const Controller = require('./src/controller')
const service = require('./src/service')

const argv = process.argv
const includedArgv = argv.slice(2, argv.length)

if (!includedArgv) {
    console.log('Invalid Command!')
    console.log('Action Parameter is Required.')
    process.exit(0)
}

const parsingArgv = function (dataArguments=[]) {
    let data = {}
    for (const argGroup of dataArguments) {
        const splArg = argGroup.split('=')
        const key = (splArg[0] ? splArg[0] : '').replace('--', '')
        const value = (splArg[1] ? splArg[1] : '')
        if (key && value) data[key] = value
    }
    return data
}

const x = new Controller({service})

x.handle(parsingArgv(includedArgv))