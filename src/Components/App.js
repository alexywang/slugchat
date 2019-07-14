import React, {Component} from 'react';
import logo from '../logo.svg';
import '../css/App.css';
import Chat from './Chat';
const socketIOClient = require('socket.io-client');

class App extends Component{

  render() {
    return (
      <div>
        <Chat></Chat>
      </div>
    )
  }

}

export default App; 