const http = require("http");
const express = require("express");
var cors = require('cors');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const connectToMongo = require('./db');

// Connect to MongoDB
connectToMongo();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true, 
  },
});

// Store connected users (just for demonstration purposes)
const connectedUsers = {};

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Save the socket id for the connected user
  socket.on('register_user', (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  });

  // Join a room (Optional - Useful if you want specific rooms for chat)
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle private message
  socket.on('send_message', (data) => {
    const { senderId, receiverId, message } = data;

    // Ensure the receiver is online
    if (connectedUsers[receiverId]) {
      io.to(connectedUsers[receiverId]).emit('receive_message', { senderId, message });
      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } else {
      console.log(`User ${receiverId} is offline`);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    // Remove the user from the connectedUsers map
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/message'));

// Start server
server.listen(9000, () => console.log(`Server started on PORT:9000`));
