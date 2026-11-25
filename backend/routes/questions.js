/* ===== routes/questions.js  (Member B) =====
   1. GET  /questions          browse + search answered PUBLIC questions
   2. GET  /ask/:expertId      page with the "ask a question" form
   3. POST /questions          validate and save a new question */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireRole } = require('../middleware/auth');


/* ---------- 1. Browse and search public questions ---------- */

router.get('/questions', async function (req, res) {
  // The search form uses method="get", so the values arrive in the URL:
  // /questions?search=heart&specialty=Cardiology  ->  req.query
  const search = (req.query.search || '').trim();
  const specialty = (req.query.specialty || '').trim();

  // Always: only PUBLIC questions that already have an answer.
  // This is what protects private questions (the server decides, not the browser).
  const where = { isPublic: true, answer: { not: null } };

  // Add the search text if there is one: "text OR answer contains the word"
  if (search !== '') {
    where.OR = [
      { text: { contains: search } },
      { answer: { contains: search } }
    ];
  }

  // Add the specialty if one was chosen (the specialty lives in the expert's profile)
  if (specialty !== '') {
    where.expert = { expertProfile: { specialty: specialty } };
  }

  const questions = await prisma.question.findMany({
    where: where,
    orderBy: { answeredAt: 'desc' },
    include: {
      asker: { select: { name: true } },                                  // select = only what we need
      expert: { select: { id: true, name: true, expertProfile: true } }   // (never send password hashes)
    }
  });

  // List of specialties for the dropdown, each one only once
  const rows = await prisma.expertProfile.findMany({
    select: { specialty: true },
    distinct: ['specialty']
  });
  const specialties = rows.map(function (row) { return row.specialty; });

  res.render('questions', { questions, specialties, search, specialty });
});


/* ---------- helper: find an expert by id (or null) ---------- */

async function findExpert(id) {
  if (isNaN(id)) {
    return null;
  }
  return await prisma.user.findFirst({
    where: { id: id, role: 'expert' },
    select: { id: true, name: true, expertProfile: true }
  });
}


/* ---------- 2. Show the ask-a-question page ---------- */

// requireRole('user') = only logged-in regular users can open this page
router.get('/ask/:expertId', requireRole('user'), async function (req, res) {
  const expert = await findExpert(parseInt(req.params.expertId));
  if (!expert) {
    return res.status(404).send('Expert not found');
  }
  res.render('ask', {
    expert: expert,
    error: null,
    oldText: '',
    sent: req.query.sent === '1'      // true after a successful submit
  });
});


/* ---------- 3. Save a new question ---------- */

router.post('/questions', requireRole('user'), async function (req, res) {
  // Read what the form sent (names match the name="" attributes in the form)
  const expertId = parseInt(req.body.expertId);
  const text = (req.body.text || '').trim();
  const isPublic = req.body.visibility === 'public';   // anything else counts as private

  const expert = await findExpert(expertId);
  if (!expert) {
    return res.status(404).send('Expert not found');
  }

  // SERVER-SIDE validation (the browser can be bypassed, so we always check here)
  let error = null;
  if (text.length < 15) {
    error = 'Please write at least 15 characters.';
  } else if (text.length > 2000) {
    error = 'Your question is too long (maximum 2000 characters).';
  }

  if (error) {
    // Show the same page again with the error and keep what the user typed
    return res.render('ask', { expert, error, oldText: text, sent: false });
  }

  // Save the question. askerId comes from the SESSION, never from the form,
  // so nobody can ask a question pretending to be someone else.
  await prisma.question.create({
    data: {
      text: text,
      isPublic: isPublic,
      askerId: req.session.user.id,
      expertId: expert.id
    }
  });

  // Tell the expert (this uses Member C's Notification table)
  await prisma.notification.create({
    data: {
      message: 'New question from ' + req.session.user.name,
      link: '/dashboard',
      userId: expert.id
    }
  });

  // Redirect so refreshing the page does not send the form twice
  res.redirect('/ask/' + expert.id + '?sent=1');
});

module.exports = router;
