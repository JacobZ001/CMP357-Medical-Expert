let users = [
  {
    email: "ahmed@gmail.com",
    password: "12345678",
  },
  {
    email: "sara@gmail.com",
    password: "password123",
  },
  {
    email: "layla@gmail.com",
    password: "123456",
  },
];

let loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let email = document.getElementById("exampleFormControlInput1").value;
  let password = document.getElementById("inputPassword6").value;

  if (email === "" || password === "") {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Please enter both email and password.";

    loginForm.after(message);
  } else {
    let user = users.find(function (u) {
      return u.email === email && u.password === password;
    });

    if (user) {
      let message = document.createElement("div");
      message.className = "alert alert-success mt-3";
      message.textContent = "Login successful! Welcome to MedExpert Q&A.";

      loginForm.after(message);

      setTimeout(function () {
        window.location.href = "";
      }, 2000);
    } else {
      let message = document.createElement("div");
      message.className = "alert alert-danger mt-3";
      message.textContent = "Incorrect email or password!";

      loginForm.after(message);
    }
  }
});
