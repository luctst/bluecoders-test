const { hash } = require('bcrypt');

const sessionLogic = require('../utils/sessionLogic');

/**
 * Create a new user if not already register.
 * @param {Object} data - The date send by the request body
 * @param {Object} mongo - The mongo client instance use for manipulate bdd
 */
module.exports = async function registerController(data, mongo) {
  const usersCol = mongo.db().collection('users');

  if ((await usersCol.findOne({ mail: data.mail })) === null) {
    const passwordHashed = await hash(data.password, 10);
    const newUser = await usersCol.insertOne({
      mail: data.mail,
      password: passwordHashed,
      tasks: {
        todo: [],
        doing: [],
        done: [],
      },
    });

    const sessionData = await sessionLogic(mongo, newUser);
    return {
      code: 200,
      header: sessionData.header,
      forClient: sessionData.forClient,
    };
  }

  return {
    code: 409,
  };
};
