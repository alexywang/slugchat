const socket = require('socket.io');
const path = require('path');
const EventEmitter = require('events');


class SocketMap extends Map{
    
    registerSocketJoin(socketid, userid, roomid){
        if(this.has(socketid)){ //Append to that user's rooms.
            let storedData = this.get(socketid);
            storedData.rooms.push(roomid);
            console.log(storedData);
            this.set(socketid, storedData);
        }else{
            this.set(socketid, {
                userid: userid,
                rooms: [roomid]
            });
        }
    }
}

class Room {
    constructor(id, name, capacity){
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.users = [];
        this.messages = [];
        this.socketUserMap = []
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

    removeUser(userid){
        const isNotUser = (item) => item.id !== userid; 
        this.users = this.users.filter(isNotUser);
    }
}

class ChatServer {
    constructor(socketServer, lobbyNamespace){
        this.server = socketServer;
        this.rooms = [];
        this.nextId = 1;
        this.socketMap = new SocketMap();
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
                this.getRoom(roomid).addUser(user);
                socket.broadcast.to(roomid).emit('joinRoom', {
                    user: user
                });
                //TODO: Implement user->rooms mapping                
                this.updateClients();

                this.socketMap.registerSocketJoin(socket.id, user.id, roomid);

            });

            // Remove a user from all their rooms when they disconnect
            socket.on('disconnect', () => {
                console.log(socket.id + ' is disconnecting.');
                console.log(this.socketMap.has(socket.id) + ' _______');
                if(this.socketMap.has(socket.id)){
                    const {userid, rooms} = this.socketMap.get(socket.id);
                    rooms.map(roomid => {
                        this.getRoom(roomid).removeUser(userid);
                    });
                    this.socketMap.delete(socket.id);
                }
                this.updateClients();
            });

            // socket.on('disconnect', () => {
            //     console.log(socket.id + ' disconnecting from' + socket.roomid + ' as ' +socket.user);
            //     this.getRoom(socket.roomid).removeUser(socket.user);
            // });

        });

        this.rooms.push(this.generateDefaultRoom());
        this.rooms.push(this.generateDefaultRoom());
        this.rooms.push(this.generateDefaultRoom());

        this.lobbyEmitter = new EventEmitter();
        return this.lobbyEmitter;
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
        this.updateClients();
        return newRoom;
    }

    removeRoom(id){
        const roomDoesntMatchId = (room) => room.id !== id; 
        // Filter rooms with id matching the parameter
        this.rooms = this.rooms.fitler(roomDoesntMatchId);
        this.updateClients();
    }

    updateClients(){
        console.log('updating clients');
        this.lobbyEmitter.emit('serverSideRoomChange', this.rooms);
    }



}

module.exports = ChatServer;