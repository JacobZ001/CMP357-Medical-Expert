// Member A: register, login and logout
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// checks the fields both register forms have. returns an error message or null
function checkAccount(firstName, lastName, email, password) {
  if (!firstName || !lastName || !email || !password) {
    return 'Please fill in all required fields.';
  }
  if (!email.includes('@') || !email.includes('.')) {
    return 'Please enter a valid email address.';
  }
  if (password.length < 8 || password.length > 20) {
    return 'Password must be between 8 and 20 characters.';
  }
  return null;
}


// ----- login -----

router.get('/login', function (req, res) {
  res.render('login', { error: null, email: '' });
});

router.post('/login', async function (req, res) {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  if (email === '' || password === '') {
    return res.render('login', { error: 'Please enter your email and password.', email: email });
  }

  const user = await prisma.user.findUnique({ where: { email: email } });

  // same message for wrong email and wrong password
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.render('login', { error: 'Invalid email or password.', email: email });
  }

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});


// ----- register a regular user -----

router.get('/register', function (req, res) {
  res.render('register', { error: null, old: {} });
});

router.post('/register', async function (req, res) {
  const firstName = (req.body.firstName || '').trim();
  const lastName = (req.body.lastName || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  let error = checkAccount(firstName, lastName, email, password);
  if (!error && await prisma.user.findUnique({ where: { email: email } })) {
    error = 'An account with this email already exists.';
  }
  if (error) {
    return res.render('register', { error: error, old: req.body });
  }

  const user = await prisma.user.create({
    data: {
      name: firstName + ' ' + lastName,
      email: email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'user'
    }
  });

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
});


// ----- register an expert -----

router.get('/register/expert', function (req, res) {
  res.render('register_expert', { error: null, old: {} });
});

router.post('/register/expert', async function (req, res) {
  const firstName = (req.body.firstName || '').trim();
  const lastName = (req.body.lastName || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const specialty = (req.body.specialty || '').trim();
  const qualifications = (req.body.qualifications || '').trim();
  const bio = (req.body.bio || '').trim();

  let error = checkAccount(firstName, lastName, email, password);
  if (!error && (!specialty || !qualifications)) {
    error = 'Please enter your specialty and qualifications.';
  }
  if (!error && await prisma.user.findUnique({ where: { email: email } })) {
    error = 'An account with this email already exists.';
  }
  if (error) {
    return res.render('register_expert', { error: error, old: req.body });
  }

  // creates the User row and the ExpertProfile row together
  const user = await prisma.user.create({
    data: {
      name: 'Dr. ' + firstName + ' ' + lastName,
      email: email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'expert',
      expertProfile: {
        create: { specialty: specialty, qualifications: qualifications, bio: bio }
      }
    }
  });

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
});

module.exports = router;
