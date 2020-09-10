const { compare } = require('bcrypt');
const { ObjectID } = require('mongodb');
const sessionLogic = require('../utils/sessionLogic');

/**
 * Check if an user is register and if his data are correct then create a session either return 400x status code.
 * @param {Object} data - The date send by the request body
 * @param {Object} mongo - The mongo client instance use for manipulate bdd
 */
module.exports = async function LoginController(data, mongo) {
  const usersCol = mongo.db().collection('users');
  const user = await usersCol.findOne(
    { mail: data.mail },
    { projection: { password: 1 } },
  );

  if (user === null) {
    return {
      code: 403,
    };
  }

  if (await compare(data.password, user.password)) {
    const sessionsCol = mongo.db().collection('sessions');
    const userSession = await sessionsCol
      .find({ userId: new ObjectID(user._id) })
      .toArray();

    if (userSession.length > 0) {
      return {
        code: 409,
      };
    }

    const sessionData = await sessionLogic(mongo, user);
    return {
      code: 200,
      header: sessionData.header,
      forClient: sessionData.forClient,
    };
  }

  return {
    code: 401,
  };
};
