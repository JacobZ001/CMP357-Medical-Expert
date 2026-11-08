// questions.js shows all answered public questions and lets the user search and filter them

const searchBox = document.getElementById("searchBox");
const specialtyFilter = document.getElementById("specialtyFilter");
const questionList = document.getElementById("questionList");
const resultCount = document.getElementById("resultCount");

const experts = getExperts();
const questions = getQuestions();


const specialties = [];
for (const expert of experts) {
  if (!specialties.includes(expert.specialty)) {
    specialties.push(expert.specialty);
  }
}

for (const specialty of specialties) {
  const option = document.createElement("option");
  option.value = specialty;
  option.textContent = specialty;
  specialtyFilter.appendChild(option);
}

// Showing the questions that match the search 
function showQuestions() {
  const searchText = searchBox.value.toLowerCase();   // lowercase so "Heart" = "heart"
  const chosenSpecialty = specialtyFilter.value;      // "" means "All specialties"

  let html = "";
  let count = 0;

  for (const question of questions) {
    // Skip private questions and questions with no answer yet
    if (!question.isPublic || question.answer === "") {
      continue;
    }

    const expert = findExpert(question.expertId);

    const matchesText = (question.text + " " + question.answer)
      .toLowerCase()
      .includes(searchText);

    // Checks if the specialty is chosen
    const matchesSpecialty = chosenSpecialty === "" || expert.specialty === chosenSpecialty;

    // Only show it if BOTH are true
    if (matchesText && matchesSpecialty) {
      html += makeQuestionCard(question);
      count++;
    }
  }

  if (count === 0) {
    html = '<div class="alert alert-secondary">No questions found. Try a different search.</div>';
  }

  questionList.innerHTML = html;
  resultCount.textContent = count + " question(s) found";
}

// Run again every time the user types or changes the dropdown
searchBox.addEventListener("input", showQuestions);
specialtyFilter.addEventListener("change", showQuestions);

// Run once when the page opens, to show everything
showQuestions();
