/* ===== routes/dev.js =====  TEMPORARY - DELETE BEFORE SUBMITTING
   A fake login so Member B and C can test without waiting for Member A.
   Open http://127.0.0.1:3000/login and click a person.
   Once Member A builds the real /login in routes/auth.js, A's version
   is used instead (auth.js is loaded before this file). */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/login', async function (req, res) {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  let html = '<h2>Test login (temporary)</h2><ul>';
  for (const u of users) {
    html += '<li><a href="/dev-login/' + u.id + '">' + u.name + '</a> (' + u.role + ', id ' + u.id + ')</li>';
  }
  html += '</ul>';
  res.send(html);
});

router.get('/dev-login/:id', async function (req, res) {
  const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!user) {
    return res.send('No such user');
  }
  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/');
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

module.exports = router;
