const { Server, Socket } = require('socket.io');
const { getAllUsers, createUser, deleteUserBySocketId } = require('../controllers/users');

/**
 * Socket event listener functions for sending and receiving
 * events that add, update, retrieve, or delete users
 * @param {Socket} socket
 * @param {Server} io
 */
const user = async (socket, io) => {
  socket.on('user entered', async (username) => {
    try {
      await createUser({ socketId: socket.id, username: username, isBusy: false });

      const usersList = await getAllUsers();
      io.emit('get user list', usersList);
      io.to(socket.id).emit('get socket id', socket.id);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('update user list', async () => {
    try {
      const usersList = await getAllUsers();
      io.emit('get user list', usersList);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('user exit', async () => {
    try {
      await deleteUserBySocketId(socket.id);

      const usersList = await getAllUsers();
      console.log("usersList");
      console.log(usersList);
      io.emit('get user list', usersList);
    } catch (error) {
      console.error("45",error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      await deleteUserBySocketId(socket.id);


      const usersList = await getAllUsers();
      console.log("usersList 51");
      console.log(usersList);
      io.emit('get user list', usersList);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = user;
