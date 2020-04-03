const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const expressWs = require('express-ws');

const {nanoid} = require('nanoid');


const Message = require('./models/Message');
const User = require('./models/User');

const users = require('./app/user');

const app = express();
const port = 8000;

expressWs(app);

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const run = async () => {
  await mongoose.connect('mongodb://localhost/radio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
  });

  app.use('/users', users);

  const connections = {};
  const usernamess = [];


  app.ws('/chat', async function  (ws, req) {
    const user = await User.findOne({token:req.query.token});
    usernamess.push(user.username);
    const messages = await Message.find();
    const id = nanoid();
    console.log(`client connected id=' + ${id}`);

    connections[id] = ws;

    console.log('total clients connected: ' + Object.keys(connections).length);
    ws.send(JSON.stringify({
      type: 'LAST_MESSAGES',
      messages: messages.slice(-10),
      usernames:usernamess
    }));

    ws.on('message', (msg) => {
      console.log(`Incoming message from ${id}: `, msg);

      const parsed = JSON.parse(msg);

      switch (parsed.type) {
        case 'ON_USER':
          Object.keys(connections).forEach(connId => {
            const connection = connections[connId];
            const newMessage = {
              username: usernamess,
            };
            connection.send(JSON.stringify({
              type: 'ON_USERS',
              ...newMessage
            }));

          });
          break;
         case 'CREATE_MESSAGE':

             Object.keys(connections).forEach( async (connId)  => {
               const connection = connections[connId];
               const newMessage = {
                 username: user.username,
                 text: parsed.text
               };
               const mess = new Message(newMessage);
               await mess.save(newMessage);
               connection.send(JSON.stringify({
                 type: 'NEW_MESSAGE',
                  username:mess.username,
                  text:mess.text
               }));

             });
          break;
        case 'DELETE_MESSAGES':
          Object.keys(connections).forEach( async (connId)  => {
            const connection = connections[connId];
            await Message.findOneAndDelete({_id:parsed.id});
           const messages = await Message.find();
            connection.send(JSON.stringify({
              type: 'NEW_MESSAGES',
              messages:messages
            }));

          });
          break;
        default:
          console.log('NO TYPE: ' + parsed.type);
      }
    });

    ws.on('close', (msg) => {
      console.log(`client disconnected! ${id}`);

      delete connections[id];
      for(let i = usernamess.length - 1; i >= 0; i--) {
        if(usernamess[i] === user.username) {
          usernamess.splice(i, 1);
        }
      }
      Object.keys(connections).forEach(  (connId)  => {
        const connection = connections[connId];

        connection.send(JSON.stringify({
          type: 'ON_USERS',
          username:usernamess,

        }));

      });
    });
  });

  app.listen(port, () => {
    console.log(`HTTP Server started on ${port} port!`);
  });
};

run().catch(e => {
  console.error(e);
});