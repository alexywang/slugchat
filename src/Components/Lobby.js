import React, {Component} from 'react';
import socketIOClient from 'socket.io-client';

class Lobby extends Component {
    constructor(props){
        super(props);
        this.state = { 
            rooms: [],
            endpoint: 'localhost:4000'
        }
    }

    
    componentDidMount(){
        const {endpoint} = this.state;
        
        // Connect
        this.socket = socketIOClient(endpoint + '/lobby');
        
        // Listen

        this.socket.on('roomList', roomList => { // Reflect rooms stored on server.
            console.log('Receiving room list...');
            this.setState({rooms: roomList});
        });
    }

    render(){
        const {onRoomJoin} = this.props;
        return(
            <div className="Lobby">
                <RoomList rooms={this.state.rooms} onRoomJoin={onRoomJoin}/>
            </div>
        )
    }
}

const RoomList = ({rooms, onRoomJoin}) => {
    return (
        <div className="RoomList">
            {
                rooms.map(aRoom =>
                    <Room key={aRoom.id} room={aRoom} onRoomJoin = {() => onRoomJoin(aRoom)}>
                        Join
                    </Room>
                )
            }
        </div>
    )
}

const Room = ({room, onRoomJoin, children}) => {
    const {name, capacity, users} = room;
    return (
        <div className="Room"> 
            <span id="title">{name}</span> 
            <span id="userlist">{users.map(user => user.name)}</span>
            <span id ="capacity">{`${users.length}/${capacity}`}</span>   
            <button id="join"
                onClick={onRoomJoin}
            >
            {children}
            </button> 
        </div> 
    )
}

export default Lobby;