const { MongoClient } = require('mongodb');

let client = new MongoClient(process.env.MONGODB_URI_CHAT);

/**
 * Connect MongoDB client
 */
const main = async () => {
  try {
    await client.connect();
    console.log('mongo db connected-----------socket');

    // Clean database every time the server restarts
    await client.db('chat').collection('users').deleteMany({});
    await client.db('chat').collection('room').deleteMany({});

    console.log('Connected to MongoDB');
  } catch (e) {
    console.log(e);
  }
};

module.exports = { client, main };
