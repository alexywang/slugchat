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
      rooms : []
    }

    this.addRoom = this.addRoom.bind(this);
  }

  addRoom(newRoom){
    console.log('Adding a new chat.');
    const isSameRoom = room => room.id === newRoom.id;
    //Check if room already exists
    const oldRooms = this.state.rooms;
    if(!oldRooms.find(isSameRoom)){
      const newRooms = [...oldRooms, newRoom];
      this.setState({rooms: newRooms});
    }
  }

  renderChat(room){
    return (
      <div id = {room.id}>
        Here is a chat.
      </div>
    )
  }

  renderAllChats(){
    const {rooms} = this.state;
    return (
      <div className="AllChats">
            {rooms.map(room => this.renderChat(room))}
      </div>
    )
  }

  render() {
    return (
      <div className="ChatContainer">
        <Lobby
          onRoomJoin={this.addRoom}
        ></Lobby>

        {this.renderAllChats()}
      </div>
    )
  }

}

export default App; 