// MEMBER A: GET /experts (search + filter), GET /experts/:id (profile),
// and the "save expert" routes go here.
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireLogin, requireRole } = require('../middleware/auth');
const { addRating } = require('../lib/helpers');

module.exports = router;
