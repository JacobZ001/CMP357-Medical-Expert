/* ===== middleware/auth.js =====
   Middleware = a function that runs BEFORE the route handler.
   It can stop the request (redirect / error) or let it continue with next().

   How login works: when a user logs in, Member A's code stores a small object
   in the session:   req.session.user = { id: 5, name: "Demo User", role: "user" }
   These two functions only CHECK that object. Use them like this:

       router.get('/dashboard', requireLogin, handler)         // any logged-in user
       router.post('/questions', requireRole('user'), handler)  // only regular users
       router.post('/answer', requireRole('expert'), handler)   // only experts
*/

// Allows any logged-in user
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');       // not logged in: go to the login page
  }
  next();                                 // logged in: continue to the route
}

// Allows only one role ("user" or "expert")
function requireRole(role) {
  return function (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
      return res.status(403).send('Only ' + role + 's can do this.');   // 403 = forbidden
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
