const express = require("express");
const {ObjectId} = require("mongodb");

const response = require("../utils/response");
const isConnected = require("../middlewares/isConnected");

const router = express.Router();

router.get("/", isConnected,  async function (req, res) {
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

router.get('/:id', isConnected, async function (req, res) {
  const forClient = {};
  const tasksCol = res.locals.mongo.db().collection('tasks');

  const task = await tasksCol.findOne(
    { _id: new ObjectId(req.params.id)},
    {
      projection: { _id: 0 }
    }
  );

  if (res.locals.data.forClient) {
    forClient.token = res.locals.data.forClient.token;
  }

  forClient.task = task;
  return response(res, 200, {
    header: res.locals.data.header,
    newResponse: {...forClient}
  })
});

router.post("/", isConnected, async function (req, res) {
  const bodyArray = Object.keys(req.body);
  const forClient = {};

  if (bodyArray.length > 2) {
    return response(res, 400);
  }

  if (!bodyArray.includes('title') || !bodyArray.includes('author')) {
    return response(res, 422);
  }

  const taskToInsert = {
    ...req.body,
    description: '',
    created: new Date(),
    status: "todo",
    tags: [],
  };
  const tasksCol = res.locals.mongo.db().collection('tasks');
  await tasksCol.insertOne({ ...taskToInsert });

  const tasksList = await tasksCol.find().toArray();

  if (res.locals.data.forClient) {
    forClient.token = res.locals.data.forClient.token;
  }

  forClient.tasks = [...tasksList];

  return response(res, 200, {
    header: res.locals.data.header,
    newResponse: { ...forClient }
  });
});

router.put('/:id', function (req, res) {
  const bodyArray = Object.keys(req.body);

  if (bodyArray.length > 6) {
    return response(res, 400);
  }
});

router.delete("/:id", function (req, res) {});

module.exports = router;
