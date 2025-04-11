require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app); // Use HTTP server with Express
const io = require("socket.io")(server, {
  pingInterval: 60000, // Send a ping every 5s
  pingTimeout: 600000, // If no response in 7s, disconnect
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});
const cors = require("cors");

app.use(cors());

const video = require("./src/socket/pubsub/video");
const user = require("./src/socket/pubsub/users");
const privateChat = require("./src/socket/pubsub/privateChat");

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  user(socket, io);
  privateChat(socket, io);
  video.streamPeers(socket, io); // test

  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.broadcast.emit("callEnded");
  });
  console.log("A user connected");
  // Handle socket events here
});

server.listen(process.env.PORT || 3020, () => {
  console.log(`Server running on port ${process.env.PORT || 3020}`);
});
