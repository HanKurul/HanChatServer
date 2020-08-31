const fsextra = require("fs-extra");
const path = require("path");

const IconPath = path.join(process.cwd(), "./Rooms/Icons");
fsextra.mkdirsSync(IconPath);

const { Room, Message } = require("../Config/Config.js");

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

async function RoomSideBarInfo() {
  const rooms = await Room.findAll({});

  const RoomInfos = [];

  await asyncForEach(rooms, async (Room) => {
    const ProfilePic = await fsextra.readFileSync(
      path.join(process.cwd(), Room.dataValues.IconPath),
      { encoding: "base64" }
    );

    const roominfo = {
      _id: Room.dataValues.id,
      RoomName: Room.dataValues.Roomname,
      LastMessage: Room.dataValues.LastMessage,
      LastSender: Room.dataValues.LastSender,
      icon: "data:image/jpeg;base64," + ProfilePic,
    };
    RoomInfos.push(roominfo);
  });

  return { data: RoomInfos };
}

async function SentRoomMessages(req) {
  if (!req.RoomId) return { error: "Bad Request" };

  const messages = await Message.findAll({
    where: {
      RoomID: req.RoomId,
    },
  });

  const PickedMessages = [];

  await asyncForEach(messages, async (message) => {
    const amessage = {
      Sender: message.dataValues.Sender,
      Message: message.dataValues.Text,
    };

    PickedMessages.push(amessage);
  });

  return { data: PickedMessages };
}

async function SaveMessageToRoom(req) {
  if (!req.RoomId || !req.Msg) return { error: "Bad Request" };

  await Message.create({
    RoomID: req.RoomId,
    Text: req.Msg.Message,
    Sender: req.Msg.Sender,
  });

  await Room.update(
    { LastMessage: req.Msg.Message, LastSender: req.Msg.Sender },
    {
      where: {
        id: req.RoomId,
      },
    }
  );

  return { data: "Message Sent !" };
}

module.exports = { SentRoomMessages, RoomSideBarInfo, SaveMessageToRoom };
