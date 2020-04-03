import React, {Component} from 'react';
import {connect} from "react-redux"
import ReconnectingWebSocket from "reconnecting-websocket"
import {Button} from 'reactstrap'
class MainPage extends Component {
    state = {
        text: '',
        username: 'Anonymous',
        messages: [],
        users:''
    };

    componentDidMount() {
        if (this.props.user === null){
            this.props.history.push('/login')
        }else {
            const options = {
                debug:true,
                connectionTimeout: 1000,
                maxRetries:10
            };
            this.websocket = new ReconnectingWebSocket(`ws://localhost:8000/chat?token=${this.props.user.token}`,[],options);

        }
        this.websocket.onmessage = (message) => {
            try {


                const data = JSON.parse(message.data);

                if (data.type === 'NEW_MESSAGE') {
                    const newMessage = {
                        username: data.username,
                        text: data.text
                    };

                    this.setState({messages: [...this.state.messages, newMessage]})
                } else if (data.type === 'LAST_MESSAGES') {
                    this.setState({messages: data.messages,users:data.usernames});
                }else if (data.type === 'ON_USERS'){
                    this.setState({users:data.username});
                }else if (data.type === 'NEW_MESSAGES'){
                    this.setState({messages:data.messages})
                }
            } catch (e) {
                console.log('Something went wrong', e);
            }
        };

    }
    sendUsername = () => {
        const user = {
            type: 'ON_USER',
            user:this.props.user.username
        };
        this.websocket.send(JSON.stringify(user));
    };
    sendMessage = e => {
        e.preventDefault();

        const message = {
            type: 'CREATE_MESSAGE',
            text: this.state.text
        };

        this.websocket.send(JSON.stringify(message));
        this.sendUsername();
    };

    deleteMessage = (id)=> {

        const delMess = {
            type:'DELETE_MESSAGES',
            id:id
        };
       this.websocket.send(JSON.stringify(delMess));

    };



    changeField = e => this.setState({[e.target.name]: e.target.value});

    render() {

        return (
            <>
                <form onSubmit={this.sendMessage}>
                    <input type="text" value={this.state.text} name="text" onChange={this.changeField} />
                    <button type="submit">Send message!</button>
                </form>
                <div style={{display:"flex"}}>
                    <div style={{width:"300px",border:"1px solid",borderRadius:"3px"}}>
                        <strong>Online users:</strong>
                        {Object.keys(this.state.users).map((msg, i) => (
                            <div key={i}>
                                {this.state.users[msg]}
                            </div>
                        ))}
                    </div>
                    <div>
                        {this.state.messages.map((msg, i) => (
                            <div key={i}>
                                <strong>{msg.username}: </strong>{msg.text}
                                {(this.props.user.role === 'admin' ? <Button onClick={() => {this.deleteMessage(msg._id)}}>delete</Button>:null)}
                            </div>
                        ))}
                    </div>


                </div>

            </>
        );
    }
}

const mapStateToProps = state => ({
   user:state.users.user
});

export default connect(mapStateToProps,null) (MainPage);