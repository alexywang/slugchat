const socket = require('socket.io');
const path = require('path');
const ChatServer = require('./chat.js');

class Lobby {
    constructor(socketServer){
        this.server = socketServer;
        this.nextId = 1;
        this.lobbyNamespace = undefined;
        this.chatServer = undefined;
    }

    startLobby(){
        this.chatServer = new ChatServer(this.server);
        this.chatServer.startChatServer()
        .then(this.createLobbyNamespace());
     
        // console.log('Starting chat namespace');
        // this.chatNamespace = this.server.of('/chat');
        // this.chatNamespace.on('connection', (socket) => {
            
        // })   
    }

    async createLobbyNamespace(){
        console.log('Starting lobby namespace');

        this.lobbyNamespace = this.server.of('/lobby');
        this.lobbyNamespace.on('connection', (socket) => {
            // Define lobby listeners
            console.log(socket.id + ' has connected to the lobby');

            // Send the send the just connected socket the list of rooms
            console.log(this.chatServer ? true : false);
            this.lobbyNamespace.to(socket.id).emit('roomList', this.chatServer.getRooms());
        });
        return this.lobbyNamespace;

    }

    createRoom(name, capacity){
        this.chatServer.createRoom(name, capacity);
    }

    removeRoom(id){
        this.chatServer.removeRoom(id);
    }
}


module.exports = Lobby;