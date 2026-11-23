// MEMBER A: register, login and logout routes go here.
// IMPORTANT: when a user logs in, store exactly this in the session:
//     req.session.user = { id: user.id, name: user.name, role: user.role };
// and on logout:  req.session.destroy(...)
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

module.exports = router;
