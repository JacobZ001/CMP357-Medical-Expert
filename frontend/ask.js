// Finding which expert this page is about by reading the "id" part.
const params = new URLSearchParams(window.location.search);
const expertId = Number(params.get("id"));   // Number() turns the text "3" into the number 3

const askForm = document.getElementById("askForm");
const questionText = document.getElementById("questionText");
const successMessage = document.getElementById("successMessage");


// when user clicks Send question
askForm.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading

  // checking the question before saving it
  const text = questionText.value.trim();   // trim() removes spaces at the start and end

  if (text.length < 15) {
    questionText.classList.add("is-invalid");   // shows the red border and message
    successMessage.classList.add("d-none");
    return;                                     // stops here. Not saved
  }
  questionText.classList.remove("is-invalid");

  // Read the public/private choice 
  const chosenRadio = document.querySelector('input[name="visibility"]:checked');
  const isPublic = chosenRadio.value === "public";   // true or false

  // Builds the new question object
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

  // loads the list, adds the new question at the start, saves the list again
  const allQuestions = getQuestions();
  allQuestions.unshift(newQuestion);
  saveQuestions(allQuestions);

  // Tells user it worked and empties the form
  askForm.reset();
  successMessage.classList.remove("d-none");
});
