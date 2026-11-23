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

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  let email = document.getElementById("exampleFormControlInput1").value;
  let password = document.getElementById("inputPassword6").value;

  if (email === "" || password === "") {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3";
    message.textContent = "Please enter both email and password.";

    loginForm.after(message);
  } else {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let message = document.createElement("div");
        message.className = "alert alert-success mt-3";
        message.textContent = "Login successful! Welcome to MedExpert Q&A.";

        loginForm.after(message);

        setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 2000);
      } else {
        let message = document.createElement("div");
        message.className = "alert alert-danger mt-3";
        message.textContent = data.message || "Incorrect email or password!";

        loginForm.after(message);
      }
    } catch (error) {
      console.error("Login error:", error);

      let message = document.createElement("div");
      message.className = "alert alert-danger mt-3";
      message.textContent =
        "Unable to connect to the server. Please try again.";

      loginForm.after(message);
    }
  }
});
