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
      `http://localhost/Counseling%20System/backend/counselor/get_counselor_details.php?id=${counselorId}`,
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

    const counselor = data.data || data;
    displayCounselorModal(counselor);
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
function displayCounselorModal(counselor) {
  const modal = document.getElementById("counselorModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  modalTitle.textContent = `Counselor Details: ${
    counselor.name || counselor.username
  }`;

  // Use the photo_url from the API response or fallback to default
  const imagePath =
    counselor.photo_url || "../../assets/images/default-profile.jpg";

  modalBody.innerHTML = `
    <div style="display: flex; gap: 30px; align-items: flex-start;">
      <div style="flex: 0 0 200px; display: flex; flex-direction: column; align-items: center;">
        <img src="${imagePath}" alt="${counselor.name || counselor.username}" 
             style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; 
                    border: 4px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    background-color: #f5f5f5; display: block; margin: 0 auto;">
        ${
          !counselor.photo_url
            ? '<div style="margin-top: 10px; padding: 5px 10px; background: rgba(0,0,0,0.7); ' +
              'color: white; border-radius: 4px; font-size: 0.9rem;">No profile image</div>'
            : ""
        }
      </div>
      <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div style="margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Username:</div>
          <div style="color: #333;">${counselor.username}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Full Name:</div>
          <div style="color: #333;">${counselor.name || "N/A"}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Specialization:</div>
          <div style="color: #333;">${counselor.specialization || "N/A"}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Company:</div>
          <div style="color: #333;">${counselor.company || "N/A"}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Profession:</div>
          <div style="color: #333;">${
            counselor.current_profession || "N/A"
          }</div>
        </div>
        <div style="grid-column: 1 / -1; margin-bottom: 15px;">
          <div style="font-weight: 600; color: #045877; margin-bottom: 5px;">Description:</div>
          <div style="color: #333; line-height: 1.5;">${
            counselor.description || "No description provided"
          }</div>
        </div>
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
