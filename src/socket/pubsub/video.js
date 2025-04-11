
let clientCaller = {
  username: null,
  socketID: null,
};
let clientCallee = {
  username: null,
  socketID: null,
};

const streamPeers = (socket, io) => {
  socket.on("userEnterRoom", (username) => {
    console.log("userEnterRoom");
    if (clientCaller.username === null) {
      clientCaller = { username, socketID: socket.id };
      console.log("set clientCaller", clientCaller, socket.id);

      const message = `Hello ${username}, waiting for other user...`;
      io.to(socket.id).emit("userWaiting", message);
    } else {
      clientCallee = { username, socketID: socket.id };
      console.log("set clientCallee", clientCallee, socket.id);

      const message = `Hello ${username}, connecting you to a video chat with ${clientCaller.username}`;
      io.to(socket.id).emit("userWaiting", message);

      const readyMessage = `Connecting you to ${clientCallee.username}`;
      io.to(clientCaller.socketID).emit("roomReady", readyMessage);
    }
  });

  socket.on("videoChatOffer", ({ sdp, socketId }) => {
    console.log("videoChatOffer::", socketId);
    io.to(socketId).emit("getVideoChatOffer", sdp);
  });

  socket.on("videoChatAnswer", ({ sdp, socketId }) => {
    io.to(socketId).emit("getVideoChatAnswer", sdp);
  });

  socket.on("candidate", ({ candidate, socketId }) => {
    io.to(socketId).emit("getCandidate", candidate);
  });

  socket.on("callUser", (data) => {
    console.log('callUser');
    io.to(data.userToCall).emit("getUserCall", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log('answerCall');
    io.to(data.to).emit("callAccepted", data.signal);
  });
};

const video = {
  streamPeers,
};

module.exports = video;
