document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const modal = document.getElementById("progressModal");
  const closeModal = document.querySelector(".close-modal");
  const filterDate = document.getElementById("filterDate");
  const filterUser = document.getElementById("filterUser");
  const refreshBtn = document.getElementById("refreshBtn");

  // Initialize
  fetchProgressReports();

  // Event Listeners
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  filterDate.addEventListener("change", function () {
    fetchProgressReports();
  });

  filterUser.addEventListener("input", function () {
    fetchProgressReports();
  });

  refreshBtn.addEventListener("click", function () {
    filterDate.value = "";
    filterUser.value = "";
    fetchProgressReports();
  });
});

// Fetch progress reports from API
async function fetchProgressReports() {
  try {
    // Get logged-in user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData || !userData.counselorId) {
      throw new Error("User not authenticated or user data missing");
    }

    // Build URL with filters
    let url = `http://localhost/Counseling%20System/backend/progress/get_all_counselor_progress.php?counselorId=${userData.counselorId}`;

    const dateFilter = document.getElementById("filterDate").value;
    const userFilter = document.getElementById("filterUser").value.trim();

    if (dateFilter) {
      url += `&date=${dateFilter}`;
    }

    if (userFilter) {
      url += `&username=${encodeURIComponent(userFilter)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    renderProgressTable(data.data || data);
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    showError(
      "Failed to load progress reports",
      error.message || "Please try again later"
    );
  }
}

// Render progress reports to the table
function renderProgressTable(progressReports) {
  const tableBody = document.getElementById("progressTableBody");
  tableBody.innerHTML = "";

  if (progressReports.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-results">No progress reports found</td>
            </tr>
        `;
    return;
  }

  progressReports.forEach((report) => {
    const row = document.createElement("tr");
    const counselingDate = new Date(report.counseling_date);
    const previewText =
      report.description.length > 50
        ? report.description.substring(0, 50) + "..."
        : report.description;

    row.innerHTML = `
            <td>${counselingDate.toLocaleDateString()}</td>
            <td>${report.victim_username} (${report.victim_age})</td>
            <td>${report.counselor_name}</td>
            <td class="notes-preview">${previewText}</td>
            <td>
                <button class="btn btn-view" onclick="viewProgressDetails(${
                  report.progressId
                })">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// View progress details in modal
async function viewProgressDetails(progressId) {
  try {
    // Get logged-in user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData || !userData.counselorId) {
      throw new Error("Counselor authentication required");
    }

    // Create auth header
    const authData = {
      counselorId: userData.counselorId,
      token: localStorage.getItem("token"), // if you're using tokens
    };
    const authHeader = btoa(JSON.stringify(authData));

    const response = await fetch(
      `http://localhost/Counseling%20System/backend/progress/get_counselor_progress.php?progressId=${progressId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message);
    }

    const progress = data.data || data;
    displayProgressModal(progress);
  } catch (error) {
    console.error("Error fetching progress details:", error);
    showError(
      "Failed to load details",
      error.message || "Please try again later"
    );
  }
}

// Display progress details in modal
function displayProgressModal(progress) {
  const modal = document.getElementById("progressModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  modalTitle.textContent = `Progress Report #${progress.progressId}`;

  const counselingDate = new Date(progress.counseling_date);
  const createdDate = new Date(progress.created_at);

  const counselorPhoto = progress.counselor_photo_url
    ? `<img src="${progress.counselor_photo_url}" alt="${progress.counselor_name}" class="counselor-avatar">`
    : `<div class="counselor-avatar"><i class="fas fa-user-tie"></i></div>`;

  modalBody.innerHTML = `
        <div class="progress-details">
            <div class="detail-row">
                <div class="detail-label">Report Date:</div>
                <div class="detail-value">${createdDate.toLocaleString()}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Session Date:</div>
                <div class="detail-value">${counselingDate.toLocaleDateString()}</div>
            </div>
            
            <div class="counselor-info">
                ${counselorPhoto}
                <div class="counselor-details">
                    <div class="counselor-name">${progress.counselor_name}</div>
                    <div class="counselor-meta">
                        <div>${progress.counselor_profession}</div>
                        <div>${progress.counselor_company}</div>
                    </div>
                </div>
            </div>
            
            <div class="user-info">
                <div class="user-avatar"><i class="fas fa-user"></i></div>
                <div class="user-details">
                    <div class="user-name">${progress.victim_username}</div>
                    <div class="user-meta">
                        <div>Age: ${progress.victim_age}</div>
                        <div>Occupation: ${progress.victim_occupation}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Progress Notes:</div>
            </div>
            <div class="notes-content">${progress.description}</div>
        </div>
    `;

  modal.style.display = "block";
}

// Helper function to show error messages
function showError(title, message) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}
