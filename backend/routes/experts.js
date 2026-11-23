// Member A: experts list (search and filters) and expert profile
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { addRating } = require('../lib/helpers');

// what we load for every expert (ratings are needed for the average)
const expertFields = {
  id: true,
  name: true,
  expertProfile: true,
  questionsReceived: { where: { rating: { not: null } }, select: { rating: true } }
};


// ----- list of experts -----

router.get('/experts', async function (req, res) {
  const search = (req.query.search || '').trim();
  const specialty = (req.query.specialty || '').trim();
  const minRating = parseFloat(req.query.minRating) || 0;

  const where = { role: 'expert' };

  // search in the name, specialty and qualifications
  if (search !== '') {
    where.OR = [
      { name: { contains: search } },
      { expertProfile: { specialty: { contains: search } } },
      { expertProfile: { qualifications: { contains: search } } }
    ];
  }
  if (specialty !== '') {
    where.expertProfile = { specialty: specialty };
  }

  const found = await prisma.user.findMany({
    where: where,
    orderBy: { name: 'asc' },
    select: expertFields
  });

  // add the average rating, then keep only experts with a high enough rating
  const experts = found.map(addRating).filter(function (e) {
    return e.avgRating >= minRating;
  });

  // specialties for the dropdown
  const rows = await prisma.expertProfile.findMany({ select: { specialty: true }, distinct: ['specialty'] });
  const specialties = rows.map(function (row) { return row.specialty; });

  res.render('experts', { experts, specialties, search, specialty, minRating });
});


// ----- one expert's profile -----

router.get('/experts/:id', async function (req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(404).send('Expert not found');
  }

  const expert = await prisma.user.findFirst({
    where: { id: id, role: 'expert' },
    select: expertFields
  });
  if (!expert) {
    return res.status(404).send('Expert not found');
  }
  addRating(expert);

  // this expert's answered public questions
  const answers = await prisma.question.findMany({
    where: { expertId: id, isPublic: true, answer: { not: null } },
    orderBy: { answeredAt: 'desc' },
    include: {
      asker: { select: { name: true } },
      expert: { select: { id: true, name: true, expertProfile: true } }
    }
  });

  res.render('expert', { expert, answers });
});

module.exports = router;
