const express = require("express");
const router = express.Router();
const MyController = require("../controllers/MyController");

router.get('/', MyController.home)

module.exports = router;