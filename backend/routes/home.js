/* ===== routes/home.js  (Member B) =====
   The home page: top 3 rated experts + 3 latest public answers. */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { addRating } = require('../lib/helpers');

router.get('/', async function (req, res) {

  // 1. Get all experts, each with the ratings of the questions they answered
  const experts = await prisma.user.findMany({
    where: { role: 'expert' },
    select: {
      id: true,
      name: true,
      expertProfile: true,
      questionsReceived: {
        where: { rating: { not: null } },    // only questions that were rated
        select: { rating: true }
      }
    }
  });

  // 2. Work out each average, sort best first, keep the first 3
  const topExperts = experts
    .map(addRating)
    .sort(function (a, b) { return b.avgRating - a.avgRating; })
    .slice(0, 3);

  // 3. The 3 newest public questions that have an answer
  const recentQuestions = await prisma.question.findMany({
    where: { isPublic: true, answer: { not: null } },
    orderBy: { answeredAt: 'desc' },
    take: 3,
    include: {
      asker: { select: { name: true } },
      expert: { select: { id: true, name: true, expertProfile: true } }
    }
  });

  // 4. Fill views/index.ejs with this data
  res.render('index', { topExperts, recentQuestions });
});

module.exports = router;
