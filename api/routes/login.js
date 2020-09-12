const express = require("express");
const router = express.Router();

const response = require("../utils/response");
const loginController = require("../db/login");

router.post("/", async function (req, res) {
  const bodyArray = Object.keys(req.body);

  if (bodyArray.length >= 3) {
    return response(res, 400);
  }

  if (!bodyArray.includes("mail") || !bodyArray.includes("password")) {
    return response(res, 422);
  }

  if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.mail) === false) {
    return response(res, 400);
  }

  if (req.body.password.length < 5) {
    return response(res, 400);
  }

  const responseClient = await loginController(req.body, res.locals.mongo);
  return response(res, responseClient.code, {
    header: responseClient.header,
    newResponse: responseClient.forClient
  });
});

module.exports = router;
