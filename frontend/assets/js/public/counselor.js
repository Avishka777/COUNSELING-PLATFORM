document.addEventListener("DOMContentLoaded", function () {
  // Get counselor ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const counselorId = urlParams.get("id");

  if (!counselorId) {
    window.location.href = "../public/counselors.html";
    return;
  }

  // Fetch counselor details
  fetch(
    `http://localhost/Counseling%20System/backend/counselor/view_counselor.php?counselorId=${counselorId}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        displayCounselorDetails(data.counselor, data.availability);
        fetchOtherCounselors(counselorId);
      } else {
        throw new Error(data.error || "Failed to load counselor details");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to load counselor details. Please try again later.");
    });
});

function displayCounselorDetails(counselor, availability) {
  // Set basic info
  document.getElementById("counselor-name").textContent = counselor.name;
  document.getElementById("counselor-name-about").textContent =
    counselor.name.split(" ")[0]; // First name only

  // Set photo
  const photoElement = document.getElementById("counselor-photo");
  if (counselor.photo) {
    photoElement.src = counselor.photo;
    photoElement.alt = counselor.name;
  }

  // Set specialization
  const specializationElement = document.getElementById(
    "counselor-specialization"
  );
  if (counselor.specialization) {
    specializationElement.textContent = counselor.specialization;
  } else {
    specializationElement.textContent = "Professional Counselor";
  }

  // Set description
  const descriptionElement = document.getElementById("counselor-description");
  if (counselor.description) {
    descriptionElement.textContent = counselor.description;
  }

  // Set current profession and company
  if (counselor.current_profession) {
    document.getElementById("current-profession").textContent =
      counselor.current_profession;
  }
  if (counselor.company) {
    document.getElementById("current-company").textContent = counselor.company;
  }

  // Set specialties (from specialization field)
  const specialtiesGrid = document.getElementById("specialties-grid");
  if (counselor.specialization) {
    const specialties = counselor.specialization
      .split(",")
      .map((s) => s.trim());
    specialtiesGrid.innerHTML = specialties
      .map(
        (specialty) => `
            <div class="specialty-item">
                <i class="fas fa-check-circle"></i>
                <span>${specialty}</span>
            </div>
        `
      )
      .join("");
  }

  // Set availability
  const availabilityList = document.getElementById("availability-list");
  if (availability && Object.keys(availability).length > 0) {
    let availabilityHTML = "";

    // Convert availability object to array and sort by day
    const daysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sortedAvailability = Object.entries(availability).sort((a, b) => {
      return daysOrder.indexOf(a[0]) - daysOrder.indexOf(b[0]);
    });

    sortedAvailability.forEach(([day, slots]) => {
      if (slots.length > 0) {
        const times = slots
          .map((slot) => `${slot.start_time} - ${slot.end_time}`)
          .join(", ");
        availabilityHTML += `<p>${day}: ${times}</p>`;
      }
    });

    availabilityList.innerHTML =
      availabilityHTML || "<p>No availability set</p>";
  } else {
    availabilityList.innerHTML = "<p>No availability set</p>";
  }
}

function fetchOtherCounselors(currentCounselorId) {
  fetch("../../api/counselors/getCounselors.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.counselors.length > 0) {
        // Filter out current counselor and get 3 random others
        const otherCounselors = data.counselors
          .filter((c) => c.counselorId != currentCounselorId)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        displayOtherCounselors(otherCounselors);
      }
    })
    .catch((error) => {
      console.error("Error fetching other counselors:", error);
    });
}

function displayOtherCounselors(counselors) {
  const grid = document.getElementById("other-counselors-grid");

  if (counselors.length === 0) {
    grid.innerHTML = "<p>No other counselors available at this time.</p>";
    return;
  }

  grid.innerHTML = counselors
    .map(
      (counselor) => `
        <div class="counselor-card">
            <img src="${counselor.photo || "../../assets/images/about/user1.png"
        }" alt="${counselor.name}" />
            <h3>${counselor.name}</h3>
            <p class="specialty">${counselor.current_profession || "Professional Counselor"
        }</p>
            <div class="rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
                <span>4.5</span>
            </div>
            <a href="./counselor-details.html?id=${counselor.counselorId
        }" class="btn-outline">View Profile</a>
        </div>
    `
    )
    .join("");
}
