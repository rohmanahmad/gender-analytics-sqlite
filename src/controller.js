'use strict'

class Controller {
    constructor (inject) {
        this._inject = inject
    }

    async handle ({ action, data }) {
        try {
            switch (action) {
                case 'install':
                    await this.install(data)
                    break
                case 'train':
                    await this.trainData(data)
                    break
                case 'analyze':
                    await this.analyzeData(data)
                    break
                default:
                    throw new Error('Invalid Action. Accepted Actions Are: [train|analyze]')
            }
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async install (data) {
        try {
            const { InstallService } = this._inject.service
            const Is = new InstallService(data)
            await Is.handle()
        } catch (err) {
            throw err
        }
    }

    async trainData (data) {
        try {
            const { TrainService } = this._inject.service
            const Ts = new TrainService(data)
            await Ts.handle()
        } catch (err) {
            throw err
        }
    }

    async analyzeData (data) {
        try {
            const { AnalyzeService } = this._inject.service
            const Ts = new AnalyzeService(data)
            await Ts.handle()
        } catch (err) {
            throw err
        }
    }
}

module.exports = Controller