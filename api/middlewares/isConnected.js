const { decode, verify } = require("jsonwebtoken");
const { ObjectID } = require("mongodb");
const { compare } = require("bcrypt");

const response = require("../utils/response");
const sessionLogic = require("../utils/sessionLogic");

/**
 * Check if an user is connected
 */
module.exports = async function isConnected(req, res, next) {
  if (!req.headers.authorization) return response(res, 400, { resMessage: "test" });

  const [b, token] = req.headers.authorization.split(" ");
  if (b !== "Bearer" || !token || token.split(".").length !== 3) return response(res, 400);

  const tokenValue = decode(token);

  if (tokenValue) {
    const tokenAsArray = Object.keys(tokenValue);

    if (tokenAsArray.length !== 2) {
      return response(res, 401, {
        resMessage: "token bad syntax"
      });
    }

    if (tokenAsArray[0] !== "iss" || tokenAsArray[1] !== "exp") {
      return response(res, 401, {
        resMessage: "token bad syntax"
      });
    }

    const sessionCol = res.locals.mongo.db().collection("sessions");
    const userSession = await sessionCol.findOne(
      { _id: new ObjectID(tokenValue.iss) },
      {
        projection: { key: 1 }
      }
    );

    if (!userSession) {
      return response(res, 401, {
        resMessage: "Session not existing"
      });
    }

    return verify(token, userSession.key, async function (err) {
      if (err) {
        if (err.name === "TokenExpiredError") {
          try {
            if (await compare(userSession.key, req.cookies.token)) {
              res.locals.data = await sessionLogic(res.locals.mongo, userSession, true);
              return next();
            }
          } catch (error) {
            throw error;
          }

          return response(req, 401, {
            resMessage: "Cookie not correct"
          });
        }

        return response(res, 401, {
          resMessage: "Bad token"
        })
      }

      res.locals.data = await sessionLogic(res.locals.mongo, userSession, true, false);
      return next();
    });
  }

  return response(res, 401);
};
