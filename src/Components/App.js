import React, {Component} from 'react';
import logo from '../logo.svg';
import '../css/App.css';
import Chat from './Chat';
import Lobby from './Lobby'
const socketIOClient = require('socket.io-client');

class App extends Component{

  constructor(props){
    super(props);
    this.state = {
      joinedRooms : [],
      user: {
        name:'testUser',
        id: Math.random()
      }
    }

    this.addRoom = this.addRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
  }

  addRoom(newRoom){
    const {user} = this.state;
    const isSameRoom = room => room.id === newRoom.id;
    //Check if room already exists
    const oldRooms = this.state.joinedRooms;
    if(!oldRooms.find(isSameRoom)){
      // Try to join if they have capacity
      if(newRoom.users.length < newRoom.capacity){
        console.log('Adding a new chat.');
        const newRooms = [...oldRooms, newRoom];
        this.setState({joinedRooms: newRooms});
      }else{
        console.log('Room was full.');
      }
    }else{
      console.log('Already joined this room.')
    }
  }


  leaveRoom(targetRoom){
    const isntSameRoom = room => room.id !== targetRoom.id;
    const oldRooms = this.state.joinedRooms;
    const newRooms = oldRooms.filter(isntSameRoom);
    this.setState({joinedRooms: newRooms});
  }



  renderChat(room){
    const {user} = this.state;
    return (
      <div key ={room.id} className="grid-item">
        <div>
          <Chat
            room={room}
            user={user}
            onLeaveRoom = {this.leaveRoom}
          ></Chat>
        </div>
      </div>
    )
  }

  renderAllChats(){
    const {joinedRooms: rooms} = this.state;
    return (
      <div className="AllChats">
            {rooms.map(room => this.renderChat(room))}
      </div>
    )
  }

  render() {
    return (
      <div className="ChatGrid">
        <div className="grid-item">
          <Lobby
            onRoomJoin={this.addRoom}
          ></Lobby>
        </div>

        {this.renderAllChats()}
      
      </div>
    )
  }

}


export default App; 