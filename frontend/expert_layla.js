let saveButton = document.querySelector(".col-sm-4 .btn");

saveButton.addEventListener("click", function (event) {
  event.preventDefault();

  let message = document.createElement("div");
  message.className = "alert alert-success mt-3";
  message.textContent = "Dr. Layla Haddad has been saved to your experts.";

  saveButton.after(message);
});

// Asking a question is handled by ask.js (it saves the question with data.js)
