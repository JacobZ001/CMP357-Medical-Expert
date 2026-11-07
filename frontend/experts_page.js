let saveButton = document.querySelector(".col-sm-4 .btn");

saveButton.addEventListener("click", function (event) {
  event.preventDefault();

  let message = document.createElement("div");
  message.className = "alert alert-success mt-3";
  message.textContent = "Dr. Layla Haddad has been saved to your experts.";

  saveButton.after(message);
});

let question = document.getElementById("floatingTextarea2");

let visibility = document.querySelector(".col-sm-8 select");

let submitButton = document.querySelector(".col-sm-8 .btn");

submitButton.addEventListener("click", function (event) {
  event.preventDefault();

  let questionText = question.value.trim();

  if (questionText === "") {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Please enter your question.";

    submitButton.after(message);
  } else if (questionText.length < 15) {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Your question must contain at least 15 characters.";

    submitButton.after(message);
  } else {
    let message = document.createElement("div");
    message.className = "alert alert-success mt-3";
    message.textContent = "Your question has been submitted successfully!";

    submitButton.after(message);

    question.value = "";
  }
});
