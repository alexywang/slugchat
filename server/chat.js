const socket = require('socket.io');
const path = require('path');

class ChatServer {
    constructor(socketServer){
        this.server = socketServer;
        this.rooms = [];

    }

    startChat(){
        console.log('Starting a new chat room');

    }
}