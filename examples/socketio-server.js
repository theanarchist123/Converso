// Deploy this as a separate server on Railway/Render
// server.js
const { Server } = require('socket.io')
const { createServer } = require('http')
const express = require('express')

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ["https://converso-50.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

// Admin namespace
const adminNamespace = io.of('/admin')

adminNamespace.on('connection', (socket) => {
  console.log('Admin connected:', socket.id)
  
  // Join admin room
  socket.join('admins')
  
  // Handle ban user command
  socket.on('ban-user', (data) => {
    // Notify all admins
    adminNamespace.to('admins').emit('user-banned', data)
    
    // Notify the banned user
    io.emit(`user-${data.userId}-banned`, data)
  })
})

// User namespace  
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId
  
  if (userId) {
    socket.join(`user-${userId}`)
    
    // Listen for ban notifications
    socket.on(`user-${userId}-banned`, (data) => {
      socket.emit('account-banned', data)
    })
  }
})

httpServer.listen(process.env.PORT || 3001)