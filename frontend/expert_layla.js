let saveButton = document.querySelector(".col-sm-4 .btn");

saveButton.addEventListener("click", function (event) {
  event.preventDefault();

  let message = document.createElement("div");
  message.className = "alert alert-success mt-3";
  message.textContent = "Dr. Layla Haddad has been saved to your experts.";

  saveButton.after(message);
});

// Asking a question is handled by ask.js (it saves the question with data.js)

// Loading expert profile information from the backend
async function loadExpertProfile() {
  try {
    const response = await fetch("http://localhost:3000/api/experts/1");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load expert profile.");
    }

    const expert = data.expert;

    document.getElementById("expertName").textContent =
      `Dr. ${expert.first_name} ${expert.last_name}`;

    document.getElementById("expertSpecialty").textContent = expert.specialty;

    document.getElementById("expertBio").textContent =
      expert.bio || "No biography available.";

    document.getElementById("expertQualifications").textContent =
      expert.qualifications || "No qualifications available.";

    document.getElementById("expertRating").textContent = "No ratings yet";

    document.getElementById("ratingCount").textContent = "0 rated responses";
  } catch (error) {
    console.error("Error loading expert profile:", error);

    document.getElementById("expertName").textContent =
      "Unable to load profile";

    document.getElementById("expertSpecialty").textContent = "";

    document.getElementById("expertBio").textContent =
      "Please try again later.";

    document.getElementById("expertQualifications").textContent = "";
  }
}

loadExpertProfile();
