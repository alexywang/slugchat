import React, {Component} from 'react';
import socketIOClient from 'socket.io-client';

class Lobby extends Component {
    constructor(props){
        super(props);
        this.state = { 
            rooms: [],
            endpoint: '/'
        }

        this.onCreateRoom = this.onCreateRoom.bind(this);
    }

    onCreateRoom(event, name, capacity){
        event.preventDefault();

        if(!name || !capacity){
            return;
        }
        if(capacity > 100 || capacity < 2){
            window.alert('Capacity must be between 2 and 100');
        }
        console.log(name);
        console.log(capacity);
        const {onRoomJoin} = this.props;
        // Tell server to create the room.
        this.chatSocket.emit('createRoom', {
            name: name,
            capacity: capacity
        });

        this.chatSocket.on('newRoomReady', room => {
            onRoomJoin(room);
        });

    }
    
    componentDidMount(){
        const {endpoint} = this.state;
        
        // Connect
        this.lobbySocket = socketIOClient(endpoint + 'lobby');
        this.chatSocket = socketIOClient(endpoint + 'chats');
        
        // Listen
        this.lobbySocket.on('roomList', roomList => { // Reflect rooms stored on server.
            console.log('Receiving room list...');
            this.setState({rooms: roomList});
        });
    }

    render(){
        const {onRoomJoin} = this.props;
        return(
            <div className="Lobby">
                <RoomList rooms={this.state.rooms} onRoomJoin={onRoomJoin}/>
                <CreateRoom
                    onCreateRoom = {this.onCreateRoom}
                    
                >
                    Create Room
                </CreateRoom>
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
    const usernameList = users.map(user => user.name);

    const capacityStyle = users.length >= capacity ? {'backgroundColor': 'red'} : {'backgroundColor': 'green'}
    return (
        <div className="Room">
            <span id="title">{name}</span> 
           
           
            <button id="join"
                onClick={onRoomJoin}
            >
            {children}
            </button> 
            <span id="userlist">
                <HoverList
                    list={usernameList}
                > 
                    
                    <span id ="capacity" style={capacityStyle}>
                        {`${users.length}/${capacity}`}
                    </span>   
                </HoverList>
            </span>
        </div> 
    )
}

const HoverList =({list, children}) => {
    let key = 0;
    return(
        <div className="HoverList">
        <div className="HoverHitbox">{children}</div>
            <div className="HoverContent">
                {list.map(item => 
                    <li key ={key++}>{item}</li>    
                )}
            </div>

        </div>
    )
}

class CreateRoom extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: '',
            capacity: undefined
        }
    }

    render(){
        const {onCreateRoom, children} = this.props;
        const {name, capacity} = this.state;
        return (
            <div className="CreateRoom">
                <form onSubmit={event => onCreateRoom(event, name, capacity)}>
                    <input 
                        type="text"
                        onChange = {(event) => {
                            this.setState({name: event.target.value});
                        }}
                        value={name}
                        placeholder="Chat Room Name"
                    />
                    <input
                        type="number"
                        onChange = {(event) => {
                            this.setState({capacity: event.target.value});
                        }}
                        value={capacity}
                        placeholder="Capacity"
                    />
                    <button type="submit">{children}</button>
                </form>
            </div>
        )
    }
}
export default Lobby;