/* dashboard.js
   Two views:
   - Patient view: questions asked by "You". Track, delete, and rate answers.
   - Expert view: questions sent to one expert. Reply and delete replies.
   Login does not remember who logged in yet, so a drop-down picks the view. */


const viewSelect = document.getElementById("viewSelect");
const statsRow = document.getElementById("stats");
const listTitle = document.getElementById("listTitle");
const questionList = document.getElementById("questionList");

// Bootstrap pop-up for deleting
const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
const confirmText = document.getElementById("confirmText");
const confirmButton = document.getElementById("confirmButton");


// Drop-down: "Patient view" + one option for each expert
function fillViewSelect() {
  let html = '<option value="patient">Patient view (You)</option>';
  for (const expert of getExperts()) {
    html += `<option value="${expert.id}">Expert view: ${expert.name}</option>`;
  }
  viewSelect.innerHTML = html;
}

// Draws the chosen view. Called again after every change.
function showDashboard() {
  if (viewSelect.value === "patient") {
    showPatientView();
  } else {
    showExpertView(Number(viewSelect.value));   // option values are text, ids are numbers
  }
}

viewSelect.addEventListener("change", showDashboard);


// HTML helpers

// One number card, e.g. "3 / Questions asked"
function makeStatCard(label, value) {
  return `
    <div class="col">
      <div class="card h-100">
        <div class="card-body">
          <div class="fs-2 fw-bold">${value}</div>
          <div class="text-muted">${label}</div>
        </div>
      </div>
    </div>`;
}

// Waiting/Answered and Public/Private badges
function makeBadges(question) {
  let html = "";
  if (question.answer === "") {
    html += '<span class="badge bg-warning text-dark me-1">Waiting</span>';
  } else {
    html += '<span class="badge bg-success me-1">Answered</span>';
  }
  if (question.isPublic) {
    html += '<span class="badge bg-secondary">Public</span>';
  } else {
    html += '<span class="badge bg-dark">Private</span>';
  }
  return html;
}

// Five star buttons. Clicking star 3 calls rateAnswer(id, 3).
function makeRatingButtons(question) {
  let html = '<span class="small me-2">Rate this answer:</span>';
  for (let stars = 1; stars <= 5; stars++) {
    html += `<button type="button" class="btn btn-link p-0 fs-4 stars text-decoration-none"
                     onclick="rateAnswer(${question.id}, ${stars})">☆</button>`;
  }
  return html;
}


// PATIENT VIEW
function showPatientView() {
  const myQuestions = getQuestions().filter(function (q) {
    return q.userName === "You";
  });
  const answeredCount = myQuestions.filter(function (q) {
    return q.answer !== "";
  }).length;

  statsRow.innerHTML =
    makeStatCard("Questions asked", myQuestions.length) +
    makeStatCard("Answered", answeredCount) +
    makeStatCard("Waiting", myQuestions.length - answeredCount);

  listTitle.textContent = "My questions";

  if (myQuestions.length === 0) {
    questionList.innerHTML = '<p class="text-muted">You have not asked any questions yet.</p>';
    return;
  }

  let html = "";
  for (const question of myQuestions) {
    html += makePatientCard(question);
  }
  questionList.innerHTML = html;
}

function makePatientCard(question) {
  const expert = findExpert(question.expertId);

  let answerPart;
  if (question.answer === "") {
    answerPart = `<p class="text-muted fst-italic mt-3 mb-0">Waiting for ${expert.name} to reply.</p>`;
  } else {
    let ratingPart;
    if (question.rating === 0) {
      ratingPart = makeRatingButtons(question);
    } else {
      ratingPart = '<span class="small">You rated: </span>' + showStars(question.rating);
    }
    answerPart = `
      <div class="answer-box mt-3">${escapeHtml(question.answer)}</div>
      <div class="mt-2">${ratingPart}</div>`;
  }

  return `
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="text-muted small">
            To ${expert.name} · ${question.date} ·
            <span class="badge bg-light text-dark">${expert.specialty}</span>
          </div>
          <div>${makeBadges(question)}</div>
        </div>
        <h5 class="mt-2">${escapeHtml(question.text)}</h5>
        ${answerPart}
        <div class="text-end mt-2">
          <button type="button" class="btn btn-outline-danger btn-sm"
                  onclick="askToDelete(${question.id}, 'question')">Delete question</button>
        </div>
      </div>
    </div>`;
}


// EXPERT VIEW
function showExpertView(expertId) {
  const expert = findExpert(expertId);
  const expertQuestions = getQuestions().filter(function (q) {
    return q.expertId === expertId;
  });

  // Waiting questions first, then answered ones
  const waiting = expertQuestions.filter(function (q) { return q.answer === ""; });
  const answered = expertQuestions.filter(function (q) { return q.answer !== ""; });

  statsRow.innerHTML =
    makeStatCard("Waiting for reply", waiting.length) +
    makeStatCard("Answered", answered.length) +
    makeStatCard(`Average rating (${expert.ratingCount})`, getAverageRating(expert) + " ★");

  listTitle.textContent = "Questions for " + expert.name;

  if (expertQuestions.length === 0) {
    questionList.innerHTML = '<p class="text-muted">No questions have been sent to you yet.</p>';
    return;
  }

  let html = "";
  for (const question of waiting.concat(answered)) {
    html += makeExpertCard(question);
  }
  questionList.innerHTML = html;
}

function makeExpertCard(question) {
  let bottomPart;
  if (question.answer === "") {
    // Reply box. Its id ("reply-5") lets sendReply() find it.
    bottomPart = `
      <div class="mt-3">
        <label for="reply-${question.id}" class="form-label small">Your answer</label>
        <textarea id="reply-${question.id}" class="form-control" rows="3"
                  placeholder="Write your answer (at least 20 characters)"></textarea>
        <div class="invalid-feedback">Your answer must be at least 20 characters.</div>
        <button type="button" class="btn btn-main btn-sm mt-2"
                onclick="sendReply(${question.id})">Send reply</button>
      </div>`;
  } else {
    let ratingText = "Not rated yet";
    if (question.rating > 0) {
      ratingText = "Patient rated: " + showStars(question.rating);
    }
    bottomPart = `
      <div class="answer-box mt-3">${escapeHtml(question.answer)}</div>
      <div class="d-flex justify-content-between align-items-center mt-2">
        <span class="small">${ratingText}</span>
        <button type="button" class="btn btn-outline-danger btn-sm"
                onclick="askToDelete(${question.id}, 'answer')">Delete my answer</button>
      </div>`;
  }

  return `
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="text-muted small">From ${escapeHtml(question.userName)} · ${question.date}</div>
          <div>${makeBadges(question)}</div>
        </div>
        <h5 class="mt-2">${escapeHtml(question.text)}</h5>
        ${bottomPart}
      </div>
    </div>`;
}


// ACTIONS
// Same pattern every time: load the list -> change it -> save it -> redraw.

function rateAnswer(questionId, stars) {
  const questions = getQuestions();
  const question = questions.find(function (q) { return q.id === questionId; });
  question.rating = stars;
  saveQuestions(questions);

  // average = ratingSum / ratingCount, so a new rating adds to both
  const experts = getExperts();
  const expert = experts.find(function (e) { return e.id === question.expertId; });
  expert.ratingSum += stars;
  expert.ratingCount += 1;
  saveData("experts", experts);

  showDashboard();
}

function sendReply(questionId) {
  const replyBox = document.getElementById("reply-" + questionId);
  const text = replyBox.value.trim();

  // Validation: at least 20 characters
  if (text.length < 20) {
    replyBox.classList.add("is-invalid");       // red border + message
    return;
  }

  const questions = getQuestions();
  const question = questions.find(function (q) { return q.id === questionId; });
  question.answer = text;
  saveQuestions(questions);

  showDashboard();
}


// DELETING (with the confirmation pop-up)
// We remember which question and what to delete, then wait for "Delete".

let idToDelete = null;
let deleteType = "";      // "question" or "answer"

function askToDelete(questionId, type) {
  idToDelete = questionId;
  deleteType = type;
  if (type === "question") {
    confirmText.textContent = "Delete this question? This cannot be undone.";
  } else {
    confirmText.textContent = "Delete your answer? The question will go back to Waiting.";
  }
  confirmModal.show();
}

confirmButton.addEventListener("click", function () {
  if (deleteType === "question") {
    deleteQuestion(idToDelete);
  } else {
    deleteAnswer(idToDelete);
  }
  confirmModal.hide();
  showDashboard();
});

function deleteQuestion(questionId) {
  const remaining = getQuestions().filter(function (q) {
    return q.id !== questionId;      // keep every question except this one
  });
  saveQuestions(remaining);
}

function deleteAnswer(questionId) {
  const questions = getQuestions();
  const question = questions.find(function (q) { return q.id === questionId; });

  // If this answer was rated, take that rating out of the expert's average
  if (question.rating > 0) {
    const experts = getExperts();
    const expert = experts.find(function (e) { return e.id === question.expertId; });
    expert.ratingSum -= question.rating;
    expert.ratingCount -= 1;
    saveData("experts", experts);
  }

  question.answer = "";
  question.rating = 0;
  saveQuestions(questions);
}


// Start
fillViewSelect();
showDashboard();
