const { Server, Socket } = require("socket.io");
const {
  getAllUsers,
  createUser,
  deleteUserBySocketId,
} = require("../controllers/users");

/**
 * Socket event listener functions for sending and receiving
 * events that add, update, retrieve, or delete users
 * @param {Socket} socket
 * @param {Server} io
 */

const user = async (socket, io) => {
  socket.on("user entered", async (username) => {
    try {
      // Save the new user
      await createUser({
        socketId: socket.id,
        username,
        isBusy: false,
      });
      
      io.to(socket.id).emit("get socket id", socket.id);

      // Fetch all users
      const usersList = (await getAllUsers()) || [];
      console.log('userList =>', usersList);
      const otherUsers = usersList.filter(
        (user) => user.socketId !== socket.id
      );
      const availableUsers = otherUsers.filter((user) => !user.isBusy);

      if (availableUsers.length > 0) {
        // Pick a match
        const matchedUser =
          availableUsers[Math.floor(Math.random() * availableUsers.length)];

        // Notify both users
        io.to(socket.id).emit("getMatchedPeer", matchedUser.socketId);
        io.to(matchedUser.socketId).emit("getMatchedPeer", socket.id);
      }
    } catch (error) {
      console.error("Error in 'user entered':", error);
    }
  });

  socket.on("update user list", async () => {
    try {
      const usersList = await getAllUsers();
      io.emit("get user list", usersList);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("user exit", async () => {
    try {
      await deleteUserBySocketId(socket.id);

      const usersList = await getAllUsers();
      console.log("usersList");
      console.log(usersList);
      io.emit("get user list", usersList);
    } catch (error) {
      console.error("45", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await deleteUserBySocketId(socket.id);

      const usersList = await getAllUsers();
      console.log("usersList 51");
      console.log(usersList);
      io.emit("get user list", usersList);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = user;
