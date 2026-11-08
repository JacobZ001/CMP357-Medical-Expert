/* home.js 
   Fills the home page with data and handles the search box. */

// Getting the data (from localStorage, or the sample data on first visit)
const experts = getExperts();
const questions = getQuestions();

// Top-rated experts

function makeExpertCard(expert) {
  return `
    <div class="col">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 mb-2">
            <div class="expert-avatar">${getInitials(expert.name)}</div>
            <div>
              <h5 class="mb-0">${expert.name}</h5>
              <span class="badge bg-light text-dark">${expert.specialty}</span>
            </div>
          </div>
          <p class="text-muted small">${expert.qualifications}</p>
          <div>${showStars(getAverageRating(expert))} ${getAverageRating(expert)}
               <span class="text-muted small">(${expert.ratingCount})</span></div>
        </div>
        <div class="card-footer bg-white border-0">
          <a href="expert.html?id=${expert.id}" class="btn btn-main btn-sm">View profile</a>
        </div>
      </div>
    </div>`;
}

// Sort a COPY of the list (using [...experts]) from highest to lowest rating
const sortedExperts = [...experts].sort(function (a, b) {
  return getAverageRating(b) - getAverageRating(a);
});

// Take the first 3 and turn each one into a card
let expertsHtml = "";
for (const expert of sortedExperts.slice(0, 3)) {
  expertsHtml += makeExpertCard(expert);
}
document.getElementById("topExperts").innerHTML = expertsHtml;


// Recently answered questions

// Keep only questions that are public AND already have an answer
const answeredQuestions = questions.filter(function (q) {
  return q.isPublic && q.answer !== "";
});

let questionsHtml = "";
for (const q of answeredQuestions.slice(0, 3)) {
  questionsHtml += makeQuestionCard(q);   // this helper is in data.js
}
document.getElementById("recentQuestions").innerHTML = questionsHtml;


// Search box 

// When the form is submitted, go to the Experts page and pass the text in the URL.
// (Member A's experts.js should read "search" from the URL and fill the search box.)
document.getElementById("searchForm").addEventListener("submit", function (event) {
  event.preventDefault();   // stop the browser from reloading the page
  const text = document.getElementById("searchInput").value.trim();
  window.location.href = "experts.html?search=" + encodeURIComponent(text);
});
