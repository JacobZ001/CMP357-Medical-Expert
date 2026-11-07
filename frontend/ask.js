/* ===== ask.js =====
   Handles the "Ask this expert a question" form on expert.html. */

// STEP 1: Find out WHICH expert this page is about.
// The URL looks like expert.html?id=3, so we read the "id" part.
const params = new URLSearchParams(window.location.search);
const expertId = Number(params.get("id"));   // Number() turns the text "3" into the number 3

// STEP 2: Grab the HTML elements we need
const askForm = document.getElementById("askForm");
const questionText = document.getElementById("questionText");
const successMessage = document.getElementById("successMessage");


// STEP 3: Do something when the user clicks "Send question"
askForm.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading

  // --- Validation: check the question before saving it ---
  const text = questionText.value.trim();   // trim() removes spaces at the start and end

  if (text.length < 15) {
    questionText.classList.add("is-invalid");   // shows the red border and message
    successMessage.classList.add("d-none");
    return;                                     // stop here, do not save
  }
  questionText.classList.remove("is-invalid");

  // --- Read the public/private choice ---
  const chosenRadio = document.querySelector('input[name="visibility"]:checked');
  const isPublic = chosenRadio.value === "public";   // true or false

  // --- Build the new question object (same fields as in data.js) ---
  const newQuestion = {
    id: Date.now(),          // current time in milliseconds, so the id is always unique
    expertId: expertId,
    userName: "You",
    text: text,
    answer: "",              // no answer yet
    isPublic: isPublic,
    rating: 0,               // not rated yet
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  };

  // --- Save it: load the list, add the new question at the start, save the list again ---
  const allQuestions = getQuestions();
  allQuestions.unshift(newQuestion);
  saveQuestions(allQuestions);

  // --- Tell the user it worked and empty the form ---
  askForm.reset();
  successMessage.classList.remove("d-none");
});
