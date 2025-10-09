import express from 'express'
import dotenv from 'dotenv'
import sql from 'mssql'
import { Server } from 'socket.io'
import { createServer } from 'http'

dotenv.config()

const port = process.env.PORT ?? 3000

// ✅ Configuración correcta para SQL Server Authentication
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

// Conectar a SQL Server
try {
  await sql.connect(sqlConfig)
  console.log("✅ Conectado a SQL Server")
} catch (err) {
  console.error("❌ Error conectando a SQL Server:", err)
  process.exit(1)
}

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', async (socket) => {
  console.log('a user connected')

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

app.get('/', (req, res) => {
  res.sendFile('./client/index.html', { root: '.' })
})

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
