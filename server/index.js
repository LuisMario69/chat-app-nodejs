import express from 'express'

import { Server } from 'socket.io'
import { createServer } from 'http'

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.get('/', (req, res) => {
  res.sendFile('./client/index.html', { root: '.' })
})

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
