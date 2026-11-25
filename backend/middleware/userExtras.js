/* ===== middleware/userExtras.js  (Member C: Jacob) =====
   Runs before every page (see app.js). For whoever is logged in it loads:
   - unreadCount:    number of unread notifications, for the bell in the navbar
   - savedExpertIds: the ids of the experts this user saved, for the Save buttons
   res.locals = variables every EJS template can use. */

const prisma = require('../lib/prisma');

async function loadUserExtras(req, res, next) {
  res.locals.unreadCount = 0;
  res.locals.savedExpertIds = [];

  const user = req.session.user;
  if (user) {
    res.locals.unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    if (user.role === 'user') {
      const saved = await prisma.savedExpert.findMany({
        where: { userId: user.id },
        select: { expertId: true }
      });
      res.locals.savedExpertIds = saved.map(function (s) { return s.expertId; });   // e.g. [1, 3]
    }
  }
  next();
}

module.exports = loadUserExtras;
