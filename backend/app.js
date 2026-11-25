/* ===== app.js =====
   Starts the server. The structure follows the lecture slides:
   Express + Prisma + EJS. Each team member has their own route file in routes/,
   so this file should almost never need to change. */

require('dotenv').config();                 // loads DATABASE_URL and SESSION_SECRET from .env
const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;
const hostname = '127.0.0.1';

// --- Settings (same as lecture: EJS + form data) ---
app.set('view engine', 'ejs');                       // use EJS templates from the views/ folder
app.use(express.urlencoded({ extended: true }));     // lets us read form fields from req.body
app.use(express.static('public'));                   // serves css, images, client-side js from public/

// --- Sessions: remember who is logged in between requests ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));

// --- Make some things available in EVERY EJS template ---
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.user || null;   // lets the navbar show Login or Logout
  next();
});
app.use(require('./middleware/userExtras'));         // Member C: bell count + saved experts for every page
app.locals.stars = function (n) {                      // stars(4) gives ★★★★☆
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};
app.locals.formatDate = function (date) {              // 2 Nov 2026
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- Routes: one file per area ---
app.use('/', require('./routes/auth'));        // Member A: register, login, logout
app.use('/', require('./routes/experts'));     // Member A: expert list and profile, saved experts
app.use('/', require('./routes/home'));        // Member B: home page
app.use('/', require('./routes/questions'));   // Member B: public Q&A and asking questions
app.use('/', require('./routes/dashboard'));   // Member C: dashboards, answers, ratings, notifications

app.listen(port, hostname, function () {
  console.log('Server running at http://' + hostname + ':' + port);
});
