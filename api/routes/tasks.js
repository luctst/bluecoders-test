const express = require("express");
const cookieParser = require("cookie-parser");

const isConnected = require("../middlewares/isConnected");
const response = require("../utils/response");

const router = express.Router();

router.use(cookieParser());
router.use(isConnected());

router.get("/", async function (req, res) {
  const forClient = {};
  const tasksCol = res.locals.mongo.db().collection("tasks");

  const tasks = await tasksCol.find().toArray();

  if (res.locals.data.forClient) {
    forClient.token = res.locals.data.forClient.token;
  }

  forClient.tasks = [...tasks];

  return response(res, 200, {
    header: res.locals.data.header,
    newResponse: {...forClient}
  });
});

router.post("/", function (req, res) {
});

router.delete("/:id", function (req, res) {});

module.exports = router;
