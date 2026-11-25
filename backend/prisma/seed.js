/* ===== seed.js =====
   Fills the database with sample data so we can test.
   Run it with:  npm run seed
   (It first DELETES everything, so you can run it again any time.)
   Every sample account has the password:  password123 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// helper: a date that is n days in the past
function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  // 1. Empty all tables (children first, parents last)
  await prisma.notification.deleteMany();
  await prisma.savedExpert.deleteMany();
  await prisma.question.deleteMany();
  await prisma.expertProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 2. Create the experts (a User row + an ExpertProfile row in one step)
  const expertList = [
    { key: 'layla',   name: 'Dr. Layla Haddad',  email: 'layla@example.com',   specialty: 'Cardiology',  qualifications: 'MD, Board certified cardiologist, 14 years experience', bio: 'Heart health, blood pressure and preventive care.' },
    { key: 'omar',    name: 'Dr. Omar Nasser',   email: 'omar@example.com',    specialty: 'Dermatology', qualifications: 'MD, Dermatology fellowship, 9 years experience',        bio: 'Skin, hair and nail conditions for all ages.' },
    { key: 'sara',    name: 'Dr. Sara Khalil',   email: 'sara@example.com',    specialty: 'Pediatrics',  qualifications: 'MBBS, MRCPCH, 11 years experience',                      bio: 'Child growth, vaccines and common childhood illness.' },
    { key: 'youssef', name: 'Dr. Youssef Amin',  email: 'youssef@example.com', specialty: 'Orthopedics', qualifications: 'MD, Orthopedic surgeon, 16 years experience',            bio: 'Joint pain, sports injuries and rehabilitation.' },
    { key: 'mina',    name: 'Dr. Mina Farouk',   email: 'mina@example.com',    specialty: 'Nutrition',   qualifications: 'PhD, Clinical Nutrition, 7 years experience',            bio: 'Diet plans, diabetes nutrition and weight management.' },
    { key: 'hana',    name: 'Dr. Hana Saleh',    email: 'hana@example.com',    specialty: 'Psychiatry',  qualifications: 'MD, Psychiatry, 12 years experience',                    bio: 'Anxiety, sleep and stress management.' }
  ];

  const experts = {};   // we keep them here so questions can point to them
  for (const e of expertList) {
    experts[e.key] = await prisma.user.create({
      data: {
        name: e.name, email: e.email, passwordHash, role: 'expert',
        expertProfile: { create: { specialty: e.specialty, qualifications: e.qualifications, bio: e.bio } }
      }
    });
  }

  // 3. Create regular users
  const userList = [
    { key: 'demo', name: 'Demo User', email: 'user@example.com' },
    { key: 'sara', name: 'Sara M.',   email: 'sara.m@example.com' },
    { key: 'ali',  name: 'Ali K.',    email: 'ali@example.com' },
    { key: 'nour', name: 'Nour A.',   email: 'nour@example.com' },
    { key: 'omar', name: 'Omar T.',   email: 'omar.t@example.com' }
  ];
  const users = {};
  for (const u of userList) {
    users[u.key] = await prisma.user.create({
      data: { name: u.name, email: u.email, passwordHash, role: 'user' }
    });
  }

  // 4. Create questions. answer: null means "not answered yet".
  const questionList = [
    { asker: 'sara', expert: 'layla',   isPublic: true,  rating: 5,    ago: 5, text: 'Is a resting heart rate of 55 normal for someone who runs regularly?',
      answer: 'Yes. Trained runners often sit between 40 and 60 bpm. See a doctor if you also feel dizzy or faint.' },
    { asker: 'ali',  expert: 'omar',    isPublic: true,  rating: 4,    ago: 6, text: 'How often should I apply sunscreen when I am outdoors all day?',
      answer: 'Every two hours, and right after swimming or heavy sweating. Use SPF 30 or higher.' },
    { asker: 'nour', expert: 'sara',    isPublic: true,  rating: 5,    ago: 8, text: 'My 2-year-old has a mild fever. When should I worry?',
      answer: 'Call a doctor if it lasts more than 3 days, passes 39.5°C, or comes with a rash or unusual sleepiness.' },
    { asker: 'omar', expert: 'mina',    isPublic: true,  rating: null, ago: 9, text: 'Is intermittent fasting safe with type 2 diabetes?',
      answer: 'It can be, but only with medication adjustments from your doctor. Do not start on your own.' },
    { asker: 'sara', expert: 'youssef', isPublic: true,  rating: 3,    ago: 10, text: 'My knee clicks when I climb stairs. Should I worry?',
      answer: 'Clicking without pain is usually harmless. See an orthopedist if it comes with pain or swelling.' },
    { asker: 'nour', expert: 'hana',    isPublic: true,  rating: 5,    ago: 11, text: 'How can I fall asleep faster when I feel anxious?',
      answer: 'Keep a fixed bedtime, avoid screens for an hour before bed, and try slow breathing exercises.' },
    { asker: 'omar', expert: 'layla',   isPublic: true,  rating: 4,    ago: 12, text: 'Does drinking more water lower blood pressure?',
      answer: 'Staying hydrated helps your overall health, but it is not a treatment for high blood pressure. Follow your doctor plan.' },
    { asker: 'demo', expert: 'omar',    isPublic: true,  rating: null, ago: 3, text: 'What helps with recurring dry patches on my elbows?',
      answer: 'Use a thick fragrance-free moisturizer twice daily and avoid hot showers.' },
    { asker: 'demo', expert: 'layla',   isPublic: false, rating: null, ago: 1, text: 'Can high cholesterol be managed through diet alone?', answer: null },
    { asker: 'ali',  expert: 'layla',   isPublic: true,  rating: null, ago: 0, text: 'Are palpitations after coffee a cause for concern?',  answer: null }
  ];

  for (const q of questionList) {
    await prisma.question.create({
      data: {
        text: q.text,
        answer: q.answer,
        isPublic: q.isPublic,
        rating: q.rating,
        createdAt: daysAgo(q.ago),
        answeredAt: q.answer ? daysAgo(q.ago > 0 ? q.ago - 1 : 0) : null,
        askerId: users[q.asker].id,
        expertId: experts[q.expert].id
      }
    });
  }

  console.log('Done! Sample data created. All passwords: password123');
}

main()
  .catch(function (error) { console.error(error); })
  .finally(function () { prisma.$disconnect(); });
