/* data.js
   Shared by all pages. It does three things:
   1. Holds the sample data (experts and questions).
   2. Saves and loads data using localStorage, so changes on one page
      show up on the other pages (no back-end needed).
   3. Has small helper functions used everywhere. */


// Sample Data

const defaultExperts = [
  { id: 1, name: "Dr. Layla Haddad", specialty: "Cardiology",
    qualifications: "MD, Board certified cardiologist, 14 years experience",
    bio: "Heart health, blood pressure and preventive care.",
    ratingSum: 92, ratingCount: 20 },
  { id: 2, name: "Dr. Omar Nasser", specialty: "Dermatology",
    qualifications: "MD, Dermatology fellowship, 9 years experience",
    bio: "Skin, hair and nail conditions for all ages.",
    ratingSum: 80, ratingCount: 18 },
  { id: 3, name: "Dr. Sara Khalil", specialty: "Pediatrics",
    qualifications: "MBBS, MRCPCH, 11 years experience",
    bio: "Child growth, vaccines and common childhood illness.",
    ratingSum: 88, ratingCount: 19 },
  { id: 4, name: "Dr. Youssef Amin", specialty: "Orthopedics",
    qualifications: "MD, Orthopedic surgeon, 16 years experience",
    bio: "Joint pain, sports injuries and rehabilitation.",
    ratingSum: 57, ratingCount: 13 },
  { id: 5, name: "Dr. Mina Farouk", specialty: "Nutrition",
    qualifications: "PhD, Clinical Nutrition, 7 years experience",
    bio: "Diet plans, diabetes nutrition and weight management.",
    ratingSum: 46, ratingCount: 10 },
  { id: 6, name: "Dr. Hana Saleh", specialty: "Psychiatry",
    qualifications: "MD, Psychiatry, 12 years experience",
    bio: "Anxiety, sleep and stress management.",
    ratingSum: 83, ratingCount: 18 }
];

/* Every question has these fields:
   id, expertId, userName, text, answer, isPublic, rating, date
   - answer is "" while the expert has not replied yet
   - rating is 0 until the user rates the answer (1 to 5)
   - userName is "You" for the person using the demo */
const defaultQuestions = [
  { id: 1, expertId: 1, userName: "Sara M.",
    text: "Is a resting heart rate of 55 normal for someone who runs regularly?",
    answer: "Yes. Trained runners often sit between 40 and 60 bpm. See a doctor if you also feel dizzy or faint.",
    isPublic: true, rating: 5, date: "28 Oct 2026" },
  { id: 2, expertId: 2, userName: "Ali K.",
    text: "How often should I apply sunscreen when I am outdoors all day?",
    answer: "Every two hours, and right after swimming or heavy sweating. Use SPF 30 or higher.",
    isPublic: true, rating: 4, date: "27 Oct 2026" },
  { id: 3, expertId: 3, userName: "Nour A.",
    text: "My 2-year-old has a mild fever. When should I worry?",
    answer: "Call a doctor if it lasts more than 3 days, passes 39.5°C, or comes with a rash or unusual sleepiness.",
    isPublic: true, rating: 5, date: "25 Oct 2026" },
  { id: 4, expertId: 5, userName: "Omar T.",
    text: "Is intermittent fasting safe with type 2 diabetes?",
    answer: "It can be, but only with medication adjustments from your doctor. Do not start on your own.",
    isPublic: true, rating: 0, date: "24 Oct 2026" },
  { id: 5, expertId: 1, userName: "You",
    text: "Can high cholesterol be managed through diet alone?",
    answer: "", isPublic: false, rating: 0, date: "1 Nov 2026" },
  { id: 6, expertId: 2, userName: "You",
    text: "What helps with recurring dry patches on my elbows?",
    answer: "Use a thick fragrance-free moisturizer twice daily and avoid hot showers.",
    isPublic: true, rating: 0, date: "30 Oct 2026" },
  { id: 7, expertId: 1, userName: "Rami S.",
    text: "Are palpitations after coffee a cause for concern?",
    answer: "", isPublic: true, rating: 0, date: "2 Nov 2026" }
];


// Saving and loading (localStorage)

// localStorage can only store text, so we convert with JSON.stringify
// (object -> text) and JSON.parse (text -> object).
function loadData(key, defaultValue) {
  const savedText = localStorage.getItem(key);
  if (savedText) {
    return JSON.parse(savedText);          // we already have saved data
  }
  // First visit: store the sample data so it is there next time
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getExperts()          { return loadData("experts", defaultExperts); }
function getQuestions()        { return loadData("questions", defaultQuestions); }
function saveQuestions(list)   { saveData("questions", list); }


// Helper functions

// Find one expert using their id
function findExpert(id) {
  const experts = getExperts();
  return experts.find(function (expert) { return expert.id === id; });
}

// Average rating, e.g. 92 / 20 = 4.6
function getAverageRating(expert) {
  return Number((expert.ratingSum / expert.ratingCount).toFixed(1));
}

// Turn a number into stars: 4 becomes ★★★★☆
function showStars(rating) {
  const full = Math.round(rating);
  return '<span class="stars">' + "★".repeat(full) + "☆".repeat(5 - full) + "</span>";
}

// Stops users from typing HTML/JS into a question and breaking the page
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// First letters of the name, "Dr. Layla Haddad" becomes "LH"
function getInitials(name) {
  const words = name.replace("Dr. ", "").split(" ");
  return words[0][0] + words[1][0];
}

// Builds the HTML for ONE answered question (used on Home and Q&A pages)
function makeQuestionCard(question) {
  const expert = findExpert(question.expertId);
  let ratingText = "Not rated yet";
  if (question.rating > 0) {
    ratingText = showStars(question.rating) + " rated by the asker";
  }

  return `
    <div class="card mb-3">
      <div class="card-body">
        <div class="text-muted small">
          ${escapeHtml(question.userName)} · ${question.date} ·
          <span class="badge bg-light text-dark">${expert.specialty}</span>
        </div>
        <h5 class="mt-2">${escapeHtml(question.text)}</h5>
        <div class="answer-box mt-3">
          <div class="small text-muted mb-1">
            Answered by <a href="experts_page.html">${expert.name}</a>
          </div>
          ${escapeHtml(question.answer)}
        </div>
        <div class="mt-2 small">${ratingText}</div>
      </div>
    </div>`;
}
