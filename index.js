/* By Han Kurul*/
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const corse = require("cors");

const PORT = process.env.PORT || 5000;
const router = express.Router();

router.get("", (reg, res) => {
  res.send("Server is Online");
});

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { RegisterUser, LoginUser } = require("./Users/Users.js");
const {
  SentRoomMessages,
  RoomSideBarInfo,
  SaveMessageToRoom,
} = require("./Rooms/Rooms.js");

app.use(router);
app.use(corse());
server.listen(PORT, () => {
  console.log("server is listening " + PORT);
});

/* Client Side Socket is the parameter */
io.on("connect", (socket) => {
  console.log("A new Client Connected");

   // https://socket.io/docs/emit-cheatsheet/;

  socket.on("RoomBasicInfos", async(callback) => {
    const { data, error } = await RoomSideBarInfo();
    callback({ data, error }); 
  });


  /* User Entered a new Room */
  socket.on("EnterRoom", async (req, callback) => {
    /*Sent All Old messages to Client*/
    const { data, error } = await SentRoomMessages(req);
    
    /*Call Front end Callback*/
    callback({ data, error });

    if (req.OldRoomName)
      socket.leave(req.OldRoomName);

    /*Regires Users socked  to a room*/
    socket.join(req.RoomName);

    /*Inform room's occupants about newly joined users*/
    socket.broadcast.to(req.RoomName).emit("newmessage", {
      Sender: "admin",
      Message: `${req.UserName} has joined!`,
      createdAt: new Date()
    });
  });

  socket.on("SendMessageToRoom", async (req, callback) => {
    /*Save the new message to our db*/
    /*Also will update the rooms last message*/
    const { data, error } = await SaveMessageToRoom(req);

    /*Call Front end Callback*/
    callback({ data, error });

    /*Send new message to room's occupants*/
    if (req.Msg) socket.broadcast.to(req.RoomName).emit("newmessage", req.Msg);

    /*update This Room Last msg to live users*/
    io.emit("roomlastmessage", {
      _id: req.RoomId,
      LastMessage: req.Msg.Message,
      LastSender: req.Msg.Sender,
    });
  });

  socket.on("RegisterMsg", async(message, callback) => {
    const { success, error } = await RegisterUser(message);
    callback({ error, success });  
  });

  socket.on("LoginMsg", async(message, callback) => {
    const { error, success, ProfilePic } = await LoginUser(message);
    callback({ error, success, ProfilePic }); 
  });

  // socket.on("join", () => {});
  // socket.on("disconnect", () => {});
});
