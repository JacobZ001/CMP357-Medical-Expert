/* ===== routes/dashboard.js  (Member C: Jacob) =====
   1. GET  /dashboard                     user view or expert view
   2. POST /questions/:id/rate            user rates an answer (1 to 5)
   3. POST /questions/:id/delete          user deletes their own question
   4. POST /questions/:id/answer          expert answers a question
   5. POST /questions/:id/delete-answer   expert deletes their own answer
   6. POST /saved/:expertId               user saves / unsaves an expert   (extra feature 1)
   7. POST /notifications/read            marks notifications as read      (extra feature 2) */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireLogin, requireRole } = require('../middleware/auth');
const { addRating } = require('../lib/helpers');

// Turns "/questions/7/..." into the number 7 (or null if it is not a number)
function getId(text) {
  const id = parseInt(text);
  return isNaN(id) ? null : id;
}

// Sends the person back to the dashboard with a red message on top
function backWithError(res, message) {
  res.redirect('/dashboard?error=' + encodeURIComponent(message));
}


/* ---------- 1. The dashboard page ---------- */

router.get('/dashboard', requireLogin, async function (req, res) {
  const me = req.session.user;

  // Both roles see their newest notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  const error = req.query.error || null;

  if (me.role === 'expert') {
    // Questions sent TO this expert
    const questions = await prisma.question.findMany({
      where: { expertId: me.id },
      orderBy: { createdAt: 'desc' },
      include: { asker: { select: { name: true } } }
    });

    // Waiting questions first, then answered ones
    const waiting = questions.filter(function (q) { return q.answer === null; });
    const answered = questions.filter(function (q) { return q.answer !== null; });

    // Average rating = sum of ratings / number of rated answers
    const ratings = answered.filter(function (q) { return q.rating !== null; })
                            .map(function (q) { return q.rating; });
    let sum = 0;
    for (const r of ratings) { sum += r; }
    const avgRating = ratings.length === 0 ? 0 : Number((sum / ratings.length).toFixed(1));

    return res.render('dashboard', {
      title: 'My dashboard',
      questions: waiting.concat(answered),
      stats: { waiting: waiting.length, answered: answered.length, avgRating: avgRating, ratingCount: ratings.length },
      notifications, error
    });
  }

  // ----- user view -----
  // Questions this user asked
  const questions = await prisma.question.findMany({
    where: { askerId: me.id },
    orderBy: { createdAt: 'desc' },
    include: { expert: { select: { id: true, name: true, expertProfile: true } } }
  });
  const answeredCount = questions.filter(function (q) { return q.answer !== null; }).length;

  // Experts this user saved, with their ratings so we can show the average
  const saved = await prisma.savedExpert.findMany({
    where: { userId: me.id },
    include: {
      expert: {
        select: {
          id: true, name: true, expertProfile: true,
          questionsReceived: { where: { rating: { not: null } }, select: { rating: true } }
        }
      }
    }
  });
  const savedExperts = saved.map(function (s) { return addRating(s.expert); });

  res.render('dashboard', {
    title: 'My dashboard',
    questions: questions,
    stats: { asked: questions.length, answered: answeredCount, waiting: questions.length - answeredCount },
    savedExperts, notifications, error
  });
});


/* ---------- 2. Rate an answer (users) ---------- */

router.post('/questions/:id/rate', requireRole('user'), async function (req, res) {
  const id = getId(req.params.id);
  const rating = parseInt(req.body.rating);

  // SERVER-SIDE validation: the rating must be a whole number from 1 to 5
  if (id === null || isNaN(rating) || rating < 1 || rating > 5) {
    return backWithError(res, 'Please choose a rating from 1 to 5 stars.');
  }

  // updateMany lets us put every safety check in "where":
  // only MY question, only if it has an answer, only if it is not rated yet.
  // The expert's average is worked out from these ratings, so nothing else to update.
  await prisma.question.updateMany({
    where: { id: id, askerId: req.session.user.id, answer: { not: null }, rating: null },
    data: { rating: rating }
  });
  res.redirect('/dashboard');
});


/* ---------- 3. Delete a question (users) ---------- */

router.post('/questions/:id/delete', requireRole('user'), async function (req, res) {
  const id = getId(req.params.id);
  if (id !== null) {
    // askerId in "where" = you can only delete your own questions
    await prisma.question.deleteMany({ where: { id: id, askerId: req.session.user.id } });
  }
  res.redirect('/dashboard');
});


/* ---------- 4. Answer a question (experts) ---------- */

router.post('/questions/:id/answer', requireRole('expert'), async function (req, res) {
  const me = req.session.user;
  const id = getId(req.params.id);
  const text = (req.body.answer || '').trim();

  // SERVER-SIDE validation
  if (text.length < 20) {
    return backWithError(res, 'Your answer must be at least 20 characters.');
  }
  if (text.length > 2000) {
    return backWithError(res, 'Your answer is too long (maximum 2000 characters).');
  }

  // Only a question sent to ME that has no answer yet
  const question = await prisma.question.findFirst({
    where: { id: id, expertId: me.id, answer: null }
  });
  if (!question) {
    return res.redirect('/dashboard');
  }

  await prisma.question.update({
    where: { id: question.id },
    data: { answer: text, answeredAt: new Date() }
  });

  // Extra feature 2: tell the person who asked
  await prisma.notification.create({
    data: {
      message: me.name + ' answered your question',
      link: '/dashboard',
      userId: question.askerId
    }
  });

  res.redirect('/dashboard');
});


/* ---------- 5. Delete my answer (experts) ---------- */

router.post('/questions/:id/delete-answer', requireRole('expert'), async function (req, res) {
  const id = getId(req.params.id);
  if (id !== null) {
    // The question goes back to "waiting". Its rating is cleared too,
    // so a deleted answer no longer counts in the expert's average.
    await prisma.question.updateMany({
      where: { id: id, expertId: req.session.user.id },
      data: { answer: null, answeredAt: null, rating: null }
    });
  }
  res.redirect('/dashboard');
});


/* ---------- 6. Save / unsave an expert (users)  - extra feature 1 ---------- */

router.post('/saved/:expertId', requireRole('user'), async function (req, res) {
  const userId = req.session.user.id;
  const expertId = getId(req.params.expertId);

  const expert = expertId === null ? null
    : await prisma.user.findFirst({ where: { id: expertId, role: 'expert' } });
  if (!expert) {
    return res.status(404).send('Expert not found');
  }

  // SavedExpert has a two-part key (userId + expertId), see schema.prisma
  const key = { userId_expertId: { userId: userId, expertId: expertId } };
  const existing = await prisma.savedExpert.findUnique({ where: key });

  if (existing) {
    await prisma.savedExpert.delete({ where: key });                       // clicked again: unsave
  } else {
    await prisma.savedExpert.create({ data: { userId: userId, expertId: expertId } });
  }

  // Go back to the page the button was on (experts list, profile or dashboard)
  res.redirect(req.get('Referer') || '/dashboard');
});


/* ---------- 7. Mark notifications as read  - extra feature 2 ---------- */

router.post('/notifications/read', requireLogin, async function (req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.session.user.id, isRead: false },
    data: { isRead: true }
  });
  res.redirect('/dashboard');
});

module.exports = router;
