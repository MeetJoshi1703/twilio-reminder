// routes/callRoutes.js
const express = require("express");
const multer = require("multer");
const { makeCalls, playMessage } = require("../controllers/callController.js");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/make-calls", upload.single("numbers"), makeCalls);
router.post("/play-message", playMessage);

module.exports = router;
