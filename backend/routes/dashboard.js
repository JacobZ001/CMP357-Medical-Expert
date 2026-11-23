// MEMBER C: GET /dashboard (user view and expert view), answering a question,
// rating an answer, deleting, and notifications go here.
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireLogin, requireRole } = require('../middleware/auth');

module.exports = router;
