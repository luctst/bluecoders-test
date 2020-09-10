const express = require("express");
const cookieParser = require("cookie-parser");
const { ObjectId } = require("mongodb");

const isConnected = require("../middlewares/isConnected");
const response = require("../utils/response");

const router = express.Router();

router.use(cookieParser());
router.use(isConnected());

router.delete("/", async function (req, res) {
  const sessionsCol = res.locals.mongo.db().collection("sessions");

  await sessionsCol.findOneAndDelete(
    {
      _id: new ObjectId(res.locals.data.newSession._id)
    }
  );

  return response(res, 204);
});

module.exports = router;
