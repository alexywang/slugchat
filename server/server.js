const Lobby = require('./lobbies.js');
const express = require('express');
const socket = require('socket.io');
const path = require('path');


// Server setup
const app = express();
const server = app.listen(4000, () => {
    console.log("Listening on port 4000...");
});

// socket.io setup
const io = socket(server);

io.on('connection', socket => {
    console.log('New connection from ' + socket.id);

    socket.on('disconnect', () =>{
        console.log(socket.id + ' has disconnected.');
    });
    
    // Emit message to other clients.
    socket.on('message', (message) => {
        console.log('Receiving message from '+ message.handle);
        io.emit('message', message);
    });

    // Broadcast typer to other clients.
    socket.on('typing', (typer) =>{
        console.log('Typing from '+ typer );
        socket.broadcast.emit('typing', typer);
    });
});

const lobby = new Lobby(io);
lobby.startLobby();



// Serve static files 
app.use(express.static(path.join(__dirname, '../build')));
