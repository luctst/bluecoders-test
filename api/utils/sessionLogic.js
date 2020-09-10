const {promisify} = require("util");
const {randomFill} = require("crypto");
const {ObjectID} = require("mongodb");
const {hash} = require("bcrypt");
const {sign} = require("jsonwebtoken");
const {serialize} = require("cookie");

const createKey = promisify(randomFill);
const jwtPromisify = promisify(sign);

/**
 * Create or update an user session
 * @param {Object} mongo - Mongo instance to manipulate bdd
 * @param {Object} userSession - User data to update or create
 * @param {Boolean} updateSession - Indicate the function if it need to update or create a session.
 * @param {Boolean} update - If the session is correct and JWT still valid do not update JWT either update and return new JWT.
 */
module.exports = async function sessionLogic (mongo, userSession, updateSession = false, updateJWT = true) {
  const sessionsCol = mongo.db().collection("sessions");
  const sessionKey = await createKey(Buffer.alloc(16));
  const sessionExpireIn = new Date(Date.now() + 60 + 60 * 10000) // Session expire in 10mn.
  let newSession;

  if (updateSession) {
    const dataToUpdate = {
      expireAt: sessionExpireIn
    };

    if (updateJWT) {
      dataToUpdate.key = sessionKey.toString("hex");
    }

    newSession = await sessionsCol.findOneAndUpdate(
      {
        _id: new ObjectID(userSession._id)
      },
      {
        $set: {...dataToUpdate}
      }
    );
  } else {
    newSession = await sessionsCol.insertOne({
      userId: new ObjectID(userSession._id),
      key: sessionKey.toString("hex"),
      expireAt: sessionExpireIn
    });
  }

  if (updateJWT) {
    const tokenRefresh = await hash(sessionKey.toString("hex"), 10);
    const cookieOps = {
      httpOnly: true,
      maxAge: 3600,
      path: "/"
    };
    const newToken = await jwtPromisify(
      {
        iss: updateSession ? newSession.value._id : newSession.insertedId
      },
      sessionKey.toString("hex"),
      {
        expiresIn: "6m",
        noTimestamp: true
      }
    );

    return {
      header: {
        "Set-Cookie": serialize("token", tokenRefresh, cookieOps)
      },
      forClient: {
        token: newToken,
      },
      newSession: newSession.value
    };
  }

  return {
    newSession: newSession.value
  };
}
