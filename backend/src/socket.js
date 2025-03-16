import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import { Server } from "socket.io";
import { redisClient } from "./app.js";
import { Stream } from "./models/Stream.model.js";
import { Message } from "./models/message.model.js";
import { User } from "./models/user.model.js";

let io;
const whitelist = [process.env.URL,"https://streamsx.vercel.app"];
function initializeSocket({ server }) {
  console.log("connected socket");
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
          console.log(
            `Connected to ${origin}, whitelisting...`
          );
          
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on(
      "start-stream",
      async ({ roomId, userId, title, description, type }) => {
        try {
          if (
            [roomId, userId, title, description, title].some((x) => {
              return x == null || x == "";
            })
          ) {
            return;
          }
          // console.log(userId);

          let users = await redisClient.lRange(`room:${roomId}`, 0, -1);
          let newRoom = null;
          if (!users.includes(socket.id)) {
            await redisClient.rPush(`room:${roomId}`, socket.id);
            await redisClient.expire(`room:${roomId}`, 7200);
            // console.log("data",title,description,userId);
            const room = await Stream.findOne({
              roomId: roomId,
            });
            if (!room) {
              newRoom = await Stream.create({
                roomId: roomId,
                host: userId,
                title: title,
                description: description,
              });
            } else {
              newRoom = room;
            }
          }
          socket.join(roomId);
          // console.log(`User ${socket.id} streming room ${roomId}`);
          const user =
            await User.aggregate([
              ({
                $match: { _id: userId },
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  avatar: 1,
                  email: 1,
                },
              })
            ]);
          if (type === "private") {
            //  to subscriber only
          } else {
            // to all
            socket.broadcast.emit("hosting-live", { roomId, user: user });
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    );

    socket.on("join-stream", async ({ roomId, userId }) => {
      try {
        let users = await redisClient.lRange(`room:${roomId}`, 0, -1);
        if (!users.includes(socket.id)) {
          await redisClient.rPush(`room:${roomId}`, socket.id);
        }
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        const room = await Stream.findOneAndUpdate(
          { roomId: roomId },
          { $addToSet: { viewer: userId } },
          { new: true }
        );
        socket.to(roomId).emit("viewer-joined", socket.id);
      } catch (error) {
        console.log(error.message);
      }
    });

    socket.on("offer", ({ roomId, offer }) => {
      try {
        console.log("sending offer");
        socket.to(roomId).emit("offer", offer);
      } catch (error) {
        console.log(error.message);
      }
    });

    socket.on("answer", ({ roomId, answer }) => {
      try {
        console.log("sending answer");
        socket
          .to(roomId)
          .emit("answer", { answer: answer, viewerId: socket.id });
      } catch (error) {
        console.log(error.message);
      }
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      try {
        console.log("sending ice candidate");
        socket.to(roomId).emit("ice-candidate", candidate);
      } catch (error) {
        console.log(error.message);
      }
    });
    socket.on("call-ended", async (roomId) => {
      try {
        const roomDeleted = await Stream.findOneAndDelete({ roomId });
        await redisClient.LREM("room", 0, roomId);

        // Emit event to notify clients
        socket.to(roomId).emit("end-meeting");
      } catch (error) {
        console.error("Error handling call-ended:", error.message);
      }
    });

    socket.on("send-message", async ({ message, roomId, userId }) => {
      try {
        const roomData = await Stream.findOne({ roomId: roomId });
        if (roomData) {
          const newMessage = await Message.create({
            message: message,
            sender: userId,
            roomId: roomData._id,
          });
  
          const addMessage = await Stream.findOneAndUpdate(
            {
              roomId: roomId,
            },
            {
              $push: { messages: newMessage._id },
            }
          );
          const data2 = await Message.aggregate([
            { $match: { _id: newMessage._id } },
            {
              $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderInfo",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
          ]);
  
          io.to(roomId).emit("receiving-message", data2);
        }
      } catch (error) {
        console.log(error.message);
      }
    });

    socket.on("disconnect", async () => {
      try {
        console.log("User disconnected:", socket.id);
  
        const rooms = await redisClient.keys("room:*");
        for (const room of rooms) {
          let users = await redisClient.lRange(room, 0, -1);
          let userId = users.find((id) => id === socket.id);
  
          if (userId) {
            await redisClient.lRem(room, 1, userId);
            let updatedUsers = await redisClient.lRange(room, 0, -1);
            if (updatedUsers.length === 0) {
              await redisClient.del(room);
            }
            socket.to(room).emit("user-disconnected", userId);
            console.log(`User ${userId} left room ${room}`);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    });
  });
}

export { initializeSocket };
