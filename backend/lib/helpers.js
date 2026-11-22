/* ===== lib/helpers.js =====
   Small functions shared by several route files. */

// Takes an expert (a User that includes "questionsReceived" with ratings)
// and adds avgRating + ratingCount to it. Used on the home page and by Member A.
function addRating(expert) {
  const ratings = expert.questionsReceived.map(function (q) { return q.rating; });
  let sum = 0;
  for (const r of ratings) {
    sum += r;
  }
  const count = ratings.length;
  expert.ratingCount = count;
  expert.avgRating = count === 0 ? 0 : Number((sum / count).toFixed(1));
  return expert;
}

module.exports = { addRating };
