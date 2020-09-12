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

router.put('/:id', isConnected, async function (req, res) {
  const bodyArray = Object.keys(req.body);

  if (bodyArray.length > 4) {
    return response(res, 400);
  }

  const checkProps = bodyArray.map(function (l) {
    if (['title', 'description', 'tags'].includes(l)) {
      return true;
    }

    return false;
  });

  if (checkProps.includes(false)) {
    return response(res, 422);
  }

  const tasksCol = res.locals.mongo.db().collection('tasks');
  const l = await tasksCol.findOneAndUpdate(
    {_id: new ObjectId(req.params.id)},
    {
      $set: { ...req.body }
    }
  );

  if (!l.ok) {
    return response(res, 502);
  }

  if (res.locals.data.forClient) {
    return response(res, 200, {
      header: res.locals.data.header,
      newResponse: { ...res.locals.data.forClient },
    })
  }

  return response(res, 204);
});

router.delete("/:id", isConnected, async function (req, res) {
  const tasksCol = res.locals.mongo.db().collection('tasks');
  const deletePassed = await tasksCol.findOneAndDelete(
    {_id: new ObjectId(req.params.id)}
  );

  if (!deletePassed.ok) {
    return response(res, 502);
  }

  const newTasksList = await tasksCol.find().toArray();

  if (res.locals.data.forClient) {
    res.locals.data.forClient.tasks = [...newTasksList];

    return response(res, 200, {
      header: res.locals.data.header,
      newResponse: {...res.locals.data.forClient}
    })
  }

  return response(res, 200, {
    newResponse: {
      tasks: [...newTasksList],
    },
  });
});

module.exports = router;
