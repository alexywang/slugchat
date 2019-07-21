const socket = require('socket.io');
const path = require('path');

class Room {
    constructor(id, name, capacity){
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.users = [];
        this.messages = [];
    }

    addUser(user){
        if(this.users.length >= this.capacity){
            return false;
        }else{
            this.users.push(user);
            return true;
        }
    }

}

class Lobby {
    constructor(socketServer){
        this.server = socketServer;
        this.rooms = [];
        this.nextId = 1;
        this.lobbyNamespace = undefined;
        this.chatNamespace = undefined;
    }

    startLobby(){
        console.log('Starting lobby namespace');
        this.lobbyNamespace = this.server.of('/lobby');
        this.lobbyNamespace.on('connection', (socket) => {
            // Define lobby listeners
            console.log(socket.id + ' has connected to the lobby');

            // Send the send the just connected socket the list of rooms 
            this.lobbyNamespace.to(socket.id).emit('roomList', this.rooms);
        });

        // this.chatNamespace = this.server.of('/chat');
        // this.chatNamespace.on('connection', (socket) => {

        // })


        this.rooms.push(this.generateDefaultRoom());
        return this.lobbyNamespace;
    }

    generateRoomId(){
        let id = this.nextId;
        this.nextId++;
        return id; 
    }

    generateDefaultRoom(){
        return new Room(this.generateRoomId(), 'default room', 10);
    }

    createRoom(name, capacity){
        let newRoom = new Room(this.generateRoomId(), capacity);
        this.rooms.push(newRoom);
        return newRoom;
    }

    removeRoom(id){
        const roomDoesntMatchId = (room) => room.id !== id; 
        // Filter rooms with id matching the parameter
        this.rooms = this.rooms.fitler(roomDoesntMatchId);
    }
}


module.exports = Lobby;