document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const counselorsGrid = document.getElementById("counselorsGrid");
  const searchInput = document.getElementById("counselorSearch");
  const specializationFilter = document.getElementById("specializationFilter");

  // Fetch counselors data
  fetchCounselors();

  // Event listeners for filtering
  searchInput.addEventListener("input", filterCounselors);
  specializationFilter.addEventListener("change", filterCounselors);
});

// Fetch counselors from API
async function fetchCounselors() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/counselor/view_all_counselors.php",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    renderCounselors(data.data || data);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    showError(
      "Failed to load counselors",
      error.message || "Please try again later"
    );
  }
}

// Render counselors to the grid
function renderCounselors(counselors) {
  const counselorsGrid = document.getElementById("counselorsGrid");

  if (counselors.length === 0) {
    counselorsGrid.innerHTML = `
            <div class="no-counselors">
                <i class="fas fa-user-md"></i>
                <p>No counselors found</p>
            </div>
        `;
    return;
  }

  counselorsGrid.innerHTML = counselors
    .map(
      (counselor) => `
        <div class="counselor-card" onclick="viewCounselorDetails(${counselor.counselorId
        })">
            <div class="counselor-image-container">
                ${counselor.photo
          ? `<img src="${counselor.photo_url}" 
                          alt="${counselor.name}" class="counselor-image">`
          : `<div class="no-photo"><i class="fas fa-user-tie"></i></div>`
        }
            </div>
            <div class="counselor-info">
                <h3 class="counselor-name">${counselor.name}</h3>
                <div class="counselor-profession">
                    <i class="fas fa-briefcase"></i>
                    <span>${counselor.current_profession}</span>
                </div>
                <div class="counselor-company">
                    <i class="fas fa-building"></i>
                    <span>${counselor.company}</span>
                </div>
                <div class="counselor-specialization">${counselor.specialization
        }</div>
                <p class="counselor-description">${counselor.description || "No description available"
        }</p>
                <a href="counselor.html?id=${counselor.counselorId
        }" class="btn-view-profile">
                    View Profile <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `
    )
    .join("");
}

// Filter counselors based on search term and specialization
function filterCounselors() {
  const searchTerm = document
    .getElementById("counselorSearch")
    .value.toLowerCase();
  const specialization = document.getElementById("specializationFilter").value;

  fetchCounselors().then(() => {
    const allCards = document.querySelectorAll(".counselor-card");

    allCards.forEach((card) => {
      const name = card
        .querySelector(".counselor-name")
        .textContent.toLowerCase();
      const profession = card
        .querySelector(".counselor-profession span")
        .textContent.toLowerCase();
      const company = card
        .querySelector(".counselor-company span")
        .textContent.toLowerCase();
      const spec = card.querySelector(".counselor-specialization").textContent;
      const description = card
        .querySelector(".counselor-description")
        .textContent.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        profession.includes(searchTerm) ||
        company.includes(searchTerm) ||
        description.includes(searchTerm);

      const matchesSpecialization = !specialization || spec === specialization;

      if (matchesSearch && matchesSpecialization) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// Navigate to counselor details page
function viewCounselorDetails(counselorId) {
  window.location.href = `counselor-details.html?id=${counselorId}`;
}

// Show error message
function showError(title, message) {
  // You can use SweetAlert or any other notification library
  alert(`${title}: ${message}`);
}
