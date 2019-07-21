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
      joinedRooms : []
    }

    this.addRoom = this.addRoom.bind(this);
    this.removeRoom = this.removeRoom.bind(this);
  }

  addRoom(newRoom){
    console.log('Adding a new chat.');
    const isSameRoom = room => room.id === newRoom.id;
    //Check if room already exists
    const oldRooms = this.state.joinedRooms;
    if(!oldRooms.find(isSameRoom)){
      const newRooms = [...oldRooms, newRoom];
      this.setState({joinedRooms: newRooms});
    }
  }


  removeRoom(id){

  }



  renderChat(room){
    const testUser = {
      name: 'tester'
    }
    return (
      <div className="grid-item">
        <div key = {room.id}>
          <Chat
            room={room}
            user={testUser}
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