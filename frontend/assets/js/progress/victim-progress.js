document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const modal = document.getElementById("progressModal");
  const closeModal = document.querySelector(".close-modal");
  const filterDate = document.getElementById("filterDate");
  const filterCounselor = document.getElementById("filterCounselor");
  const refreshBtn = document.getElementById("refreshBtn");
  const progressTableBody = document.getElementById("progressTableBody");

  // Initialize
  fetchCounselors().then(() => fetchProgressReports());

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

  filterCounselor.addEventListener("change", function () {
    fetchProgressReports();
  });

  refreshBtn.addEventListener("click", function () {
    filterDate.value = "";
    filterCounselor.value = "";
    fetchProgressReports();
  });

  // Fetch counselors for filter dropdown
  async function fetchCounselors() {
    try {
      const response = await fetch(
        "http://localhost/Counseling%20System/backend/counselors/get_all_counselors.php",
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

      const counselors = data.data || data;
      populateCounselorFilter(counselors);
    } catch (error) {
      console.error("Error fetching counselors:", error);
    }
  }

  // Populate counselor filter dropdown
  function populateCounselorFilter(counselors) {
    filterCounselor.innerHTML = '<option value="">All Counselors</option>';
    
    counselors.forEach(counselor => {
      const option = document.createElement("option");
      option.value = counselor.counselorId;
      option.textContent = counselor.name;
      filterCounselor.appendChild(option);
    });
  }

  // Fetch progress reports from API
  async function fetchProgressReports() {
    try {
      // Get logged-in user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.userId) {
        throw new Error("User not authenticated or user data missing");
      }

      // Build URL with filters
      let url = `http://localhost/Counseling%20System/backend/progress/get_all_victims_progress.php?victimId=${userData.userId}`;

      if (filterDate.value) {
        url += `&date=${filterDate.value}`;
      }

      if (filterCounselor.value) {
        url += `&counselorId=${filterCounselor.value}`;
      }

      // Show loading state
      progressTableBody.innerHTML = '<tr><td colspan="4">Loading progress reports...</td></tr>';

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
      progressTableBody.innerHTML = '<tr><td colspan="4" class="error">Failed to load progress reports</td></tr>';
    }
  }

  // Render progress reports to the table
  function renderProgressTable(progressReports) {
    progressTableBody.innerHTML = "";

    if (progressReports.length === 0) {
      progressTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-results">No progress reports found</td>
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
            <td>${report.counselor_name}</td>
            <td class="notes-preview">${previewText}</td>
        `;
      progressTableBody.appendChild(row);
    });
  }
});

// Helper function to show error messages
function showError(title, message) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}