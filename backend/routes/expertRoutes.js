const express = require("express");

const router = express.Router();

const expertController = require("../controllers/expertController");

router.get("/:id", expertController.getExpertProfile);

module.exports = router;
