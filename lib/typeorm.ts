import { createConnection, Connection } from 'typeorm'

declare global {
    var ormConnection: Connection
}

async function connectionWrapper(): Promise<Connection> {
    if (!global.ormConnection) {
        global.ormConnection = await createConnection()
    }

    return global.ormConnection
}

export default connectionWrapper