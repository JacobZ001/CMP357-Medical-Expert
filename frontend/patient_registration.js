let registerForm = document.querySelector("form");

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let firstName = document.getElementById("validationCustom01").value;
  let lastName = document.getElementById("validationCustom02").value;
  let email = document.getElementById("validationCustomUsername").value;
  let password = document.getElementById("inputPassword6").value;
  let terms = document.getElementById("invalidCheck").checked;

  if (firstName === "" || lastName === "" || email === "" || password === "") {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Please fill in all required fields.";

    registerForm.after(message);
  } else if (!email.includes("@") || !email.includes(".")) {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Please enter a valid email address.";

    registerForm.after(message);
  } else if (password.length < 8 || password.length > 20) {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Password must be between 8 and 20 characters.";

    registerForm.after(message);
  } else if (terms === false) {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "You must agree to the terms and conditions.";

    registerForm.after(message);
  } else {
    let message = document.createElement("div");
    message.className = "alert alert-success mt-3";
    message.textContent =
      "Your account has been created successfully! Welcome to MedExpert Q&A.";

    registerForm.after(message);
  }
});
