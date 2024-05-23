// Import the express module
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express application
// Define a port to listen on
const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Define a simple route to handle GET requests to the root URL
app.get('/hello', (req, res) => {
    res.send('Hello, world!');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    // Send a message to the client
    socket.emit('message', 'Welcome to the Socket.IO server!');

    // Listen for messages from the client
    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Echo the message back to the client
        socket.emit('message', `You said: ${message}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });