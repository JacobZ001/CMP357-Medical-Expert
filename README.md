# MedExpert Q&A

CMP 357 – Web Application Programming, American University of Sharjah, Fall 2026 (Project 1: Medical Expert Q&A Platform)

A web app where users ask medical experts questions (public or private), experts answer them, and anyone can browse the public answers.

Built with Node.js + Express, Prisma + MySQL, EJS and Bootstrap.

## How to run

You need Node.js and MySQL Server 8.4.

1. In MySQL Workbench run: `CREATE DATABASE medexpert;`
2. In `backend/`, copy `.env.example` to `.env` and put your MySQL password in `DATABASE_URL`.
3. In `backend/` run:

```
npm install
npx prisma db push
npm run seed
npm start
```

4. Open http://127.0.0.1:3000

`npm run seed` deletes everything and puts the sample data back, so you can run it again any time.

## Sample accounts

All passwords are `password123`.

| Role | Email |
|---|---|
| User | user@example.com (Demo User), ali@example.com, sara.m@example.com |
| Expert | layla@example.com (Dr. Layla Haddad), omar@example.com, sara@example.com |

## How to navigate

| Page | URL | Who |
|---|---|---|
| Home: top-rated experts, latest answers, search box | `/` | everyone |
| Experts list: search by name / specialty / qualification, filter by specialty and rating | `/experts` | everyone |
| Expert profile: specialty, qualifications, average rating, public answers | `/experts/:id` | everyone |
| Public Q&A: search answered public questions | `/questions` | everyone |
| Register (user or expert), log in, log out | `/register`, `/register/expert`, `/login`, `/logout` | everyone |
| Ask an expert a question (public or private) | `/ask/:id` (button on the profile) | users |
| Dashboard | `/dashboard` | logged in |

**User dashboard:** see your questions and their status, rate answers (1–5 stars), delete questions, see saved experts and notifications.

**Expert dashboard:** see questions sent to you, reply (at least 20 characters), delete your answer, see your average rating and notifications.

A quick demo: log in as `user@example.com`, open Dr. Layla Haddad, ask a question, log out, log in as `layla@example.com`, answer it, then log in again as the user to see the notification and rate the answer.

## Features

Required features: registration and login for users and experts, expert profiles with average rating, search experts, ask public or private questions, experts answer, search public answers, dashboards to track and delete, rating answers. Validation is done in the browser (HTML `required`, `minlength`, `type="email"`) and again on the server in every POST route.

Extra features:

1. **Saved experts**: users click "Save" on an expert card or profile; saved experts are listed in the dashboard.
2. **Notifications**: experts get a notification when someone asks them a question, and users get one when their question is answered. The navbar bell shows the unread count, a pop-up appears while there are unread notifications, and the dashboard lists them.

## Project structure

```
backend/
  app.js              starts the server, sessions, routes
  prisma/             schema.prisma (tables) and seed.js (sample data)
  routes/             auth.js, experts.js (A) · home.js, questions.js (B) · dashboard.js (C)
  middleware/         auth.js (login checks), userExtras.js (bell count, saved experts)
  lib/                prisma.js (one Prisma client), helpers.js (average rating)
  views/              EJS pages and partials (header, footer, cards, forms)
  public/css/         style.css
frontend/             static front-end demo from the first milestone (no back-end)
docs/                 project description
```

## Database

Five tables (see `backend/prisma/schema.prisma`): `User` (users and experts, with a role), `ExpertProfile` (one per expert), `Question` (asker, expert, answer, rating), `SavedExpert` (user + expert) and `Notification`.

## Team

| Member | Part |
|---|---|
| Ayman (A) | Accounts and experts: register, login, experts list, expert profile |
| Abizar (B) | Home page, public Q&A, asking questions, database schema and seed data |
| Jacob (C) | Dashboards, answering, rating, deleting, saved experts, notifications |

## External resources

- Bootstrap 5.3 (CDN), Prisma, EJS, express-session, bcryptjs
- Course lectures 16 and 17 (Prisma + Express, EJS)
- Claude (Anthropic) was used for front end UI design and system design tutor during the project
