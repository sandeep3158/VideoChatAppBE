/**
 * Functions to request data from user collection
 */
const { ObjectId } = require('mongodb');
const { client } = require('../database');

const dbName = process.env.NODE_ENV === 'test' ? 'test' : 'chat';

/**
 * Create new user document
 * @param {Object} newUser - The new user object to be added
 * @returns {null} For testing, returns null when there is an error
 */
async function createUser(newUser) {
  try {
    await client.db(dbName).collection('users').insertOne(newUser);
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Update `isBusy` field in user document
 * @param {ObjectId} id - The user id
 * @param {boolean} status - The status of the user
 */
async function setUserStatus(id, status) {
  try {
    const update = {
      $set: { 'isBusy': status }
    };
    await client.db(dbName).collection('users').findOneAndUpdate(
      { _id: id },
      update
    );
  } catch (error) {
    console.error(error);
  }
}

/**
 * Delete user document
 * @param {string} socketId - The user's socket id
 * @returns {Object} The user object is returned for testing purposes
 */
async function deleteUserBySocketId(socketId) {
  try {
    const result = await client.db(dbName).collection('users').findOneAndDelete({ socketId });
    console.log("result");
    console.log(result);
    return result?.value;
  } catch (error) {
    console.error("54",error);
  }
}

/**
 * Get user document by id
 * @param {ObjectId} id - The user id
 * @returns {Object} The user object
 */
async function getUserById(id) {
  try {
    const result = await client.db(dbName).collection('users').findOne({ _id: id });
    return result;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get all users
 * @returns {Array} The list of all users
 */
async function getAllUsers() {
  try {
    console.log('in getalluser');
    const result = await client.db(dbName).collection('users').find().toArray();
    console.log("result");
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createUser,
  setUserStatus,
  deleteUserBySocketId,
  getUserById,
  getAllUsers
};
