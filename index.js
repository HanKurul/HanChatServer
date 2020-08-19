const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const corse = require("cors");

const PORT = process.env.PORT || 5000;
const router = express.Router();

router.get('', (reg,res) => {
    res.send('Server is Online');
});

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(corse())
server.listen(PORT, () => {console.log('server is listening ' + PORT)});

const { addUser, removeUser, getUser, getUsersInRoom } = require('./Users.js');


/* Client Side Socket is the parameter*/
io.on('connect', (socket) => {
    
    console.log("A new Client Connected")

    socket.on('join', ({ name }, callback) => {
        /* add user to the*/
        const { error, user } = addUser({ id: socket.id, name });

        if (error) return callback(error);

        /* We will Have 1 room */
        socket.join("GlobalRoom");

        /* Send Welcome Message To Joining User*/
        socket.emit('message', { user: 'admin', text: `Welcome, Mr/Ms ${user.name}` });

        /* Send To all User About Joining User*/
        socket.broadcast.to("GlobalRoom").emit('message', { user: 'admin', text: `${user.name} has joined!` });

        /* Send Information of All Users*/
        io.to("GlobalRoom").emit('onlineusers', { users: getUsersInRoom() });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
  
        io.to("GlobalRoom").emit('message', message);
         
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to("GlobalRoom").emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to("GlobalRoom").emit('roomData', { users: getUsersInRoom() });
        }
    })
      
})