let searchForm = document.querySelector("form");

let searchInput = document.querySelector('input[type="search"]');

let specialty = document.getElementById("validationCustom04");

let experts = document.querySelectorAll(".col-sm-4");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let searchText = searchInput.value.toLowerCase();
  let selectedSpecialty = specialty.value;

  let found = 0;

  experts.forEach(function (expert) {
    let name = expert.querySelector(".card-title").textContent.toLowerCase();
    let expertSpecialty = expert.querySelector(".badge").textContent;

    if (
      name.includes(searchText) &&
      (selectedSpecialty === "" || expertSpecialty === selectedSpecialty)
    ) {
      expert.style.display = "block";
      found++;
    } else {
      expert.style.display = "none";
    }
  });

  let oldMessage = document.querySelector(".search-message");

  if (oldMessage) {
    oldMessage.remove();
  }

  if (found === 0) {
    let message = document.createElement("div");
    message.className = "alert alert-danger mt-3 search-message";
    message.textContent = "No experts found. Please try another search.";

    searchForm.after(message);
  } else {
    let message = document.createElement("div");
    message.className = "alert alert-success mt-3 search-message";
    message.textContent = found + " expert(s) found.";

    searchForm.after(message);
  }
});
