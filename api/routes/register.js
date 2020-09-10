const express = require("express");
const router = express.Router();

const response = require("../utils/response");
const registerController = require("../db/register");

router.use(express.json());

router.post("/", async function(req, res) {
  const bodyArray = Object.keys(req.body);

  if (bodyArray.length >= 3) {
    return response(res, 400);
  }

  if (!bodyArray.includes("mail") || !bodyArray.includes("password")) {
    return response(res, 422);
  }

  const responseClient = await registerController(req.body, res.locals.mongo);
  return response(res, responseClient.code, {
    header: responseClient.header,
    newResponse: responseClient.forClient
  });
});

module.exports = router;
