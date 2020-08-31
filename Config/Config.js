const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize("database", "username", "password", {
  dialect: "sqlite",
  storage: "./Config/db.sqlite3",
});

class User extends Model {}

User.init({
  Username: DataTypes.STRING,
  Salt: DataTypes.STRING,
  Hash: DataTypes.STRING,
  PicturePath: DataTypes.STRING
}, { sequelize, timestamps: true, modelName: 'Users' });

class Message extends Model {}
class Room extends Model {}

Room.init({
    Roomname: DataTypes.STRING,
    IconPath: DataTypes.STRING,
    LastSender: DataTypes.STRING,
    LastMessage: DataTypes.STRING,
}, { sequelize, timestamps: true, modelName: 'Rooms' });

Message.init({
    RoomID: DataTypes.STRING,
    Text: DataTypes.STRING,
    Sender: DataTypes.STRING
}, { sequelize, timestamps: true, modelName: 'Messages' });

/* I do this so when we have no local database it will init*/
setTimeout( async () => {
  await sequelize.sync();


  const rooms = await Room.findAll({});

  /*Init Main Rooms*/
  if (rooms.length === 0)
  {
    await Room.create({
        Roomname: "General",
        IconPath: "Rooms/Icons/Room.png",
        LastSender: "",
        LastMessage: "",
      });

      await Room.create({
        Roomname: "Fat Mamas",
        IconPath: "Rooms/Icons/Room.png",
        LastSender: "",
        LastMessage: "",
      });

      await Room.create({
        Roomname: "Memes",
        IconPath: "Rooms/Icons/Room.png",
        LastSender: "",
        LastMessage: "",
      });

      await Room.create({
        Roomname: "Retarted People",
        IconPath: "Rooms/Icons/Room.png",
        LastSender: "",
        LastMessage: "",
      });
  }

},1000)

module.exports = {sequelize,User,Room,Message};