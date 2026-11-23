const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

router.post("/register/patient", authController.registerPatient);

router.post("/register/expert", authController.registerExpert);

router.post("/login", authController.loginUser);

router.get("/me", authController.getCurrentUser);

module.exports = router;
