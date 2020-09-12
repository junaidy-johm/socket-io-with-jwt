'use strict'
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

//Bring in the models
require("./models/User");
require("./models/Chatroom");
require("./models/Message");

const app = require("./app");

const server = app.listen(4000, () => {
    console.log("Server listening on port 4000");
  });
  
  const io = require("socket.io")(server);
  const jwt = require("jwt-then");
  
  const Message = mongoose.model("Message")

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      const payload = await jwt.verify(token, process.env.SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {}
  });
  
  io.on("connection", (socket) => {
    console.log("Connected: " + socket.userId);
  
    socket.on("disconnect", () => {
      console.log("Disconnected: " + socket.userId);
    });

    socket.on("joinRoom", ({chatroomId})=>{
        socket.join(chatroomId);
        console.log("a user joined chatroom: "+ chatroomId)
    })

    socket.on("leaveRoom", ({chatroomId})=>{
        socket.leave(chatroomId);
        console.log("a user left chatroom: "+ chatroomId)
    })

    socket.on("chatroomMessage", async ({chatroomId, message})=>{
        
        if(message.trim().length > 0){
            const user = await User.findOne({_id: socket.userId});
            io.to(chatroomId).emit("newMessage",{
                message,
                user: user.name,
                userId: socket.userId,
            })
        }
    })
  });
