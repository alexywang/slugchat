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

    addMessage(message){
        this.messages.push(message);
    }
}

class ChatServer {
    constructor(socketServer){
        this.server = socketServer;
        this.rooms = [];
        this.nextId = 1;
    }

    async startChatServer(){
        console.log('Starting chat server.');
        this.chatNamespace = this.server.of('/chats');
        this.chatNamespace.on('connection', socket => {
            console.log(socket.id + ' has connected to the chat server');

            // Emit message to other clients that are in the respective room.
            socket.on('message', (message) => {
                console.log('Receiving message from ' + message.handle + ' in room ' + message.roomid);
                //Update that room's messages
                this.getRoom(message.roomid).addMessage(message);
                this.chatNamespace.to(message.roomid).emit('message', message);
            });

            // Broadcast typer to other clients in the respective room.
            socket.on('typing', ({roomid, typer}) => {
                console.log('Typing from '+ typer + ' in room '+ roomid);
                socket.broadcast.to(roomid).emit('typing', typer);
            });

            socket.on('joinRoom', ({roomid, user}) => {
                console.log('Adding ' + socket.id + ' to room '+ roomid);
                socket.join(roomid);
                socket.broadcast.to(roomid).emit('join-room', {
                    user: user
                });


            });
        });

        this.rooms.push(this.generateDefaultRoom());
        this.rooms.push(this.generateDefaultRoom());
        this.rooms.push(this.generateDefaultRoom());
        return this.chatNamespace;
    }

    generateRoomId(){
        let id = this.nextId; 
        this.nextId++;
        return id;
    }

    generateDefaultRoom(){
        return new Room(this.generateRoomId(), 'default room', 10);
    }

    getRooms(){
        return this.rooms;
    }

    getRoom(id){
        const isRoom = room => room.id === id;
        const theRoom = this.rooms.find(isRoom);
        return theRoom;
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

module.exports = ChatServer;