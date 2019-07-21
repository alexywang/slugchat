import React, {Component} from 'react';
import socketIOClient from 'socket.io-client';
import '../css/Chat.css';
import { arrayExpression } from '@babel/types';

class Chat extends Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            typers: [], 
            myHandle: "",
            myMessage: "",
            endpoint: "http://localhost:4000",
        }

        this.onMessageReceived = this.onMessageReceived.bind(this);
        this.onTypingReceived = this.onTypingReceived.bind(this);
        this.onHandleBoxChange = this.onHandleBoxChange.bind(this);
        this.onMessageBoxChange = this.onMessageBoxChange.bind(this);
        this.onMessageBoxSubmit = this.onMessageBoxSubmit.bind(this);
    }

    // Add new message to list, and remove the message's handle from the typer list.
    onMessageReceived(response){
        const messageHandleMismatch = typer => response.handle !== typer;
        
        //Append message to the current list of messages. 
        const oldMessages = this.state.messages;
        const newMessages = [...oldMessages, response]; 
        this.setState({messages: newMessages});

        //Remove the sender from the typing list. 
        const oldTypers = this.state.typers;
        const newTypers = oldTypers.filter(messageHandleMismatch);
        this.setState({typers: newTypers});
    }

    // Add the new typer handle to the typer list if they aren't there already. 
    onTypingReceived(typerHandle){
        //Append the new typer to the list 
        const oldTypers = this.state.typers;
        const newTypers = oldTypers.indexOf(typerHandle) === -1 ? [...oldTypers, typerHandle] : oldTypers;
        this.setState({typers: newTypers});
    }

    // Update the state of my handle.
    onHandleBoxChange(event){
        this.setState({myHandle: event.target.value});
    }

    // Register self as a typer with the server
    onMessageBoxChange(event){
        const {myHandle} = this.state;
        this.socket.emit('typing', myHandle) // Typing event to be emitted to the other users
        this.setState({myMessage: event.target.value});
    }

    // Submit a message to the server. 
    onMessageBoxSubmit(event){
        const{myHandle, myMessage} = this.state;

        if(myMessage.length !== 0 && myHandle.length !== 0)
        {
            this.socket.emit('message', {
                text: myMessage,
                handle: myHandle
            });
            this.setState({myMessage: ""});
        }
        
        event.preventDefault();
    }


    componentDidMount(){
        const {endpoint} = this.state;

        // Connect and define listeners
        this.socket = socketIOClient(endpoint); 
        this.socket.on('message', (message) => { // Receiving a message
            this.onMessageReceived(message);
        });
        
        this.socket.on('typing', (typer) => { // Receiving a new typer list
            this.onTypingReceived(typer);
        });
    }

    render(){
        const {messages, typers, myHandle, myMessage} = this.state;
        return (
            <div className="Chat">
                <center><h1>Slugchat</h1></center>
                <MessageDisplay messages={messages} />
                <DynamicList list={typers}/>
                <HandleBox value={myHandle} onChange={this.onHandleBoxChange}></HandleBox>
                <MessageBox value={myMessage} onChange={this.onMessageBoxChange} onSubmit={this.onMessageBoxSubmit}>Send </MessageBox>
            </div>
        )
    }
}

class MessageDisplay extends Component{
    
    render(){
        const {messages} = this.props;

        return (
            <div className="MessageDisplay">
                {messages.map(item => 
                    <div key={item.handle+" "+item.text}id="message">
                       <p> <span id="messageHandle">{item.handle}: </span> <span id="messageText">{item.text}</span> </p>
                    </div>
                )}
            </div>
        )
    }
}


    const MessageBox = ({value, onChange, onSubmit, children}) => {
    return (
        <form className="MessageBox" onSubmit = {onSubmit}>
            <input 
                type="text"
                onChange={onChange}
                value={value}
                placeholder="Message"
            />
            <button type = "submit">
                {children}
            </button>
        </form>
    )
}

const HandleBox = ({value, onChange, children}) => {
    return (
        <input type="text" className="HandleBox" onChange={onChange} value={value} placeholder="Handle">{children}</input>
    )
}

const DynamicList = ({list}) => {
    const listToString = (aList) => {
        let asString = '';
        if(aList.length === 0) return ''; 
        else{
            for(let i = 0; i < aList.length-1; i ++){
                asString += `${aList[i]}, `
            }
            asString += aList[aList.length-1];
        }
        return asString;
    }

    let connector = list.length > 1 ? 'are' : 'is';
    return(
        <div className="DynamicList">
            <p>
                {list.length > 0 ? listToString(list) +` ${connector} typing...` : ''}
            </p>
        </div>
    )
}


export default Chat;