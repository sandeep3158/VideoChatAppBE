const { Server, Socket } = require('socket.io');
const { createRoom, addUserBySocketId, getRoomUsersSocketId, getRoom, deleteRoomById } = require('../controllers/room');
const { getUserById } = require('../controllers/users');

/**
 * Socket event listener functions for sending and receiving
 * invites to a private chat, creating and closing the private
 * chat room, and for establishing the RTCPeerConnection
 * @param {Socket} socket
 * @param {Server} io
 */
const privateChat = async (socket, io) => {
  socket.on('invite private chat', (inviteeId) => {
    console.log(`${socket.id} invited ${inviteeId} to a chat`);

    // Send invite request with inviter id to invitee
    io.to(inviteeId).emit('invite requested', socket.id);
  });

  socket.on('invite accepted', async (inviterId) => {
    console.log(`${socket.id} accepted chat with ${inviterId}`);

    try {
      const roomId = await createRoom();
      await addUserBySocketId(roomId, inviterId);
      await addUserBySocketId(roomId, socket.id);
      const socketIds = await getRoomUsersSocketId(roomId);
      const roomData = { roomId: roomId.toString(), users: socketIds };

      io.in(socketIds[0]).socketsJoin(roomId.toString());
      io.in(socketIds[1]).socketsJoin(roomId.toString());
      io.to(roomId.toString()).emit('enter chat room', roomData);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('decline invite', (inviterId) => {
    console.log(`${socket.id} declined chat with ${inviterId}`);

    io.to(inviterId).emit('invite declined', socket.id);
  });

  socket.on('send chat message', (sentMessageData) => {
    const messageData = {
      msg: sentMessageData.msg,
      userId: socket.id
    };

    io.to(sentMessageData.roomId).emit('receive chat message', messageData);
    console.log('message: ' + messageData.msg);
  });

  socket.on('video request accepted', async (roomId) => {
    try {
      const room = await getRoom(roomId);
      const user = await getUserById(room.users[0]);
      const userSocketId = user.socketId;
      console.log('send video ready to ', userSocketId);
      io.to(userSocketId).emit('video ready');
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('video offer', async ({ sdp, roomId }) => {
    try {
      const room = await getRoom(roomId);
      const user = await getUserById(room.users[1]);
      const userSocketId = user.socketId;
      console.log(`send get video offer to ${userSocketId}`);

      io.to(userSocketId).emit('get video offer', sdp);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('video answer', async ({ sdp, roomId }) => {
    try {
      const room = await getRoom(roomId);
      const user = await getUserById(room.users[0]);
      const userSocketId = user.socketId;
      console.log(`answer - send get video answer to ${userSocketId}`);

      io.to(userSocketId).emit('get video answer', sdp);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('candidate', async ({ candidate, roomId }) => {
    try {
      const room = await getRoom(roomId);
      console.log(`ice candidate from ${socket.id}`);

      const user1 = await getUserById(room.users[0]);
      const user2 = await getUserById(room.users[1]);
      const user1SocketId = user1.socketId;
      const user2SocketId = user2.socketId;

      if (socket.id === user1SocketId) {
        console.log(`send get candidate to ${user2SocketId}`);
        io.to(user2SocketId).emit('get candidate', candidate);
      } else {
        console.log(`send get candidate to ${user1SocketId}`);
        io.to(user1SocketId).emit('get candidate', candidate);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('end chat', async (roomId) => {
    try {
      const room = await getRoom(roomId);
      console.log(`end chat for room ${roomId}`);

      const user1 = await getUserById(room.users[0]);
      const user2 = await getUserById(room.users[1]);
      const user1SocketId = user1.socketId;
      const user2SocketId = user2.socketId;

      await deleteRoomById(roomId);

      io.to(user1SocketId).emit('end video request');
      io.to(user2SocketId).emit('end video request');
      io.to(roomId).emit('close chat room');
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = privateChat;
