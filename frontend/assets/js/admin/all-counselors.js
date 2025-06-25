document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const modal = document.getElementById("counselorModal");
  const closeModal = document.querySelector(".close-modal");
  const searchInput = document.getElementById("counselorSearch");

  // Initialize
  fetchCounselors();

  // Event Listeners
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    filterCounselors(searchTerm);
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  document.getElementById("prevPage").addEventListener("click", goToPrevPage);
  document.getElementById("nextPage").addEventListener("click", goToNextPage);
});

// Global variables
let allCounselors = [];
const counselorsPerPage = 10;
let currentPage = 1;

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

    allCounselors = data.data || data;
    renderCounselors();
    updatePagination();
  } catch (error) {
    console.error("Error fetching counselors:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load counselors",
      text: error.message || "Please try again later",
    });
  }
}

// Render counselors to the table
function renderCounselors(counselors = allCounselors) {
  const tableBody = document.querySelector("#counselorsTable tbody");
  tableBody.innerHTML = "";

  const startIdx = (currentPage - 1) * counselorsPerPage;
  const endIdx = startIdx + counselorsPerPage;
  const paginatedCounselors = counselors.slice(startIdx, endIdx);

  if (paginatedCounselors.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-results">No counselors found</td>
            </tr>
        `;
    return;
  }

  paginatedCounselors.forEach((counselor) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${counselor.counselorId || counselor.userId}</td>
            <td>${counselor.username}</td>
            <td>${counselor.name || "N/A"}</td>
            <td>${counselor.specialization || "N/A"}</td>
            <td>${counselor.company || "N/A"}</td>
            <td class="actions">
                <button class="btn-view" onclick="viewCounselorDetails(${
                  counselor.counselorId || counselor.userId
                })">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-delete" onclick="confirmDeleteCounselor(${
                  counselor.counselorId || counselor.userId
                }, '${counselor.username}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Update showing count
  document.getElementById("showingCount").textContent =
    paginatedCounselors.length;
  document.getElementById("totalCount").textContent = counselors.length;
}

// Filter counselors based on search term
function filterCounselors(searchTerm) {
  if (!searchTerm) {
    renderCounselors();
    return;
  }

  const filteredCounselors = allCounselors.filter(
    (counselor) =>
      counselor.username.toLowerCase().includes(searchTerm) ||
      (counselor.name && counselor.name.toLowerCase().includes(searchTerm)) ||
      (counselor.specialization &&
        counselor.specialization.toLowerCase().includes(searchTerm)) ||
      (counselor.company &&
        counselor.company.toLowerCase().includes(searchTerm)) ||
      (counselor.counselorId &&
        counselor.counselorId.toString().includes(searchTerm))
  );

  renderCounselors(filteredCounselors);
}

// Pagination functions
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderCounselors();
    updatePagination();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(allCounselors.length / counselorsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderCounselors();
    updatePagination();
  }
}

function updatePagination() {
  const totalPages = Math.ceil(allCounselors.length / counselorsPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === totalPages || totalPages === 0;
}

// View counselor details in modal
async function viewCounselorDetails(counselorId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/counselor/view_counselor.php?counselorId=${counselorId}`,
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

    if (!data.success) {
      throw new Error(data.error || "Failed to load counselor details");
    }

    displayCounselorModal(data.counselor, data.availability);
  } catch (error) {
    console.error("Error fetching counselor details:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load details",
      text: error.message || "Please try again later",
    });
  }
}

// Display counselor details in modal
function displayCounselorModal(counselor, availability) {
  const modal = document.getElementById("counselorModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  modalTitle.textContent = `Counselor Details: ${
    counselor.name || counselor.username
  }`;

  // Create availability HTML
  let availabilityHTML =
    '<div class="availability-section"><h3>Availability</h3>';
  if (availability && Object.keys(availability).length > 0) {
    availabilityHTML += '<div class="availability-grid">';

    // Sort days in order
    const daysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sortedDays = Object.keys(availability).sort(
      (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
    );

    sortedDays.forEach((day) => {
      if (availability[day].length > 0) {
        availabilityHTML += `<div class="availability-day">
          <strong>${day}:</strong> `;

        const timeSlots = availability[day]
          .map((slot) => `${slot.start_time} - ${slot.end_time}`)
          .join(", ");

        availabilityHTML += timeSlots + "</div>";
      }
    });

    availabilityHTML += "</div>";
  } else {
    availabilityHTML += "<p>No availability set</p>";
  }
  availabilityHTML += "</div>";

  // Create modal content
  modalBody.innerHTML = `
    <div class="counselor-modal-content">

      
      <div class="counselor-details-section">
        <div class="detail-row">
          <span class="detail-label">Username:</span>
          <span class="detail-value">${counselor.username}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Full Name:</span>
          <span class="detail-value">${counselor.name || "N/A"}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Specialization:</span>
          <span class="detail-value">${counselor.specialization || "N/A"}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Company:</span>
          <span class="detail-value">${counselor.company || "N/A"}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Profession:</span>
          <span class="detail-value">${
            counselor.current_profession || "N/A"
          }</span>
        </div>
        
        <div class="detail-row full-width">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${
            counselor.description || "No description provided"
          }</span>
        </div>
        
        ${availabilityHTML}
      </div>
    </div>
  `;

  modal.style.display = "block";
}

// Confirm and delete counselor
function confirmDeleteCounselor(counselorId, username) {
  Swal.fire({
    title: "Confirm Delete",
    html: `Are you sure you want to delete counselor <strong>${username}</strong> (ID: ${counselorId})?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteCounselor(counselorId);
    }
  });
}

// Delete counselor
async function deleteCounselor(counselorId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/counselor/delete_counselor.php?id=${counselorId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Counselor Deleted",
        text:
          result.message ||
          `Counselor ID ${counselorId} has been deleted successfully`,
      });
      // Refresh the counselor list
      fetchCounselors();
    } else {
      throw new Error(result.message || "Failed to delete counselor");
    }
  } catch (error) {
    console.error("Error deleting counselor:", error);
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: error.message || "Could not delete counselor. Please try again.",
    });
  }
}
