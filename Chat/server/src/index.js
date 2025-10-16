import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import sql from 'mssql'
import { Server } from 'socket.io'
import { createServer } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Inicializar dotenv al inicio
dotenv.config({ path: join(__dirname, '..', '..', '.env') })

const app = express()
const server = createServer(app)
const io = new Server(server)

// Configuración y variables
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

// Función de inicio asíncrona
async function init() {
  try {
    // Validar configuración
    if (!sqlConfig.server || typeof sqlConfig.server !== 'string') {
      throw new Error('DB_SERVER no está definido correctamente en el .env')
    }

    // Mostrar configuración (sin password)
    console.log('🔍 Configuración:', {
      server: sqlConfig.server,
      port: sqlConfig.port,
      database: sqlConfig.database,
      user: sqlConfig.user
    })

    // Conectar a SQL Server
    await sql.connect(sqlConfig)
    console.log('✅ Conectado a SQL Server')

    // Configurar socket.io
    io.on('connection', async (socket) => {
      console.log('👤 Usuario conectado')

      socket.on('disconnect', () => {
        console.log('user disconnected')
      })

      socket.on('chat message', async (msg) => {
        const username = socket.handshake.auth.username ?? "Anonymous"
        console.log({ username, msg })

        try {
          const result = await sql.query`INSERT INTO Messages (Sender, Content)
                                         OUTPUT INSERTED.Id
                                         VALUES (${username}, ${msg})`
          
          const insertedId = result.recordset[0]?.Id

          io.emit('chat message', msg, insertedId.toString(), username)
        } catch (e) {
          console.error("❌ Error al insertar mensaje:", e)
        }
      })

      if (!socket.recovered) {
        try {
          const serverOffset = socket.handshake.query.serverOffset ?? 0

          const results = await sql.query`
            SELECT Id, Content, Sender
            FROM Messages
            WHERE Id > ${serverOffset}
          `

          results.recordset.forEach((row) => {
            socket.emit('chat message', row.Content, row.Id.toString(), row.Sender)
          })
        } catch (e) {
          console.error("❌ Error al recuperar mensajes:", e)
        }
      }
    })

    // Rutas
    app.get('/', (req, res) => {
      res.sendFile(join(__dirname, '..', '..', 'client', 'index.html'))
    })

    // Iniciar servidor
    server.listen(port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`)
    })
  } catch (err) {
    console.error('❌ Error iniciando servidor:', err)
    process.exit(1)
  }
}

// Ejecutar
init().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})