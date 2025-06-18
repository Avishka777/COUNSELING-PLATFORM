document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const progressTable = document.getElementById("progressTable");
  const progressTableBody = document.getElementById("progressTableBody");
  const filterForm = document.getElementById("filterForm");
  const progressModal = document.getElementById("progressModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.querySelector(".close-modal");

  // Initialize
  fetchProgressReports();

  // Event Listeners
  filterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    fetchProgressReports();
  });

  closeModal.addEventListener("click", () => {
    progressModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === progressModal) {
      progressModal.style.display = "none";
    }
  });

  // Fetch progress reports
  async function fetchProgressReports() {
    try {
      // Get logged-in user ID (or use specific victimId if admin)
      const userData = JSON.parse(localStorage.getItem("user"));
      const victimId = userData.userId; // Or get from filter form if admin

      // Get filter values
      const formData = new FormData(filterForm);
      const filters = {
        counselorId: formData.get("counselorId"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        limit: formData.get("limit"),
      };

      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append("victimId", victimId);

      for (const [key, value] of Object.entries(filters)) {
        if (value) queryParams.append(key, value);
      }

      // Show loading state
      progressTableBody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

      const response = await fetch(
        `http://localhost/Counseling%20System/backend/progress/get_all_victims_progress.php?${queryParams.toString()}`,
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

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      renderProgressTable(result.data || []);
    } catch (error) {
      console.error("Error fetching progress reports:", error);
      progressTableBody.innerHTML = `<tr><td colspan="5" class="error">${
        error.message || "Failed to load progress reports"
      }</td></tr>`;
    }
  }

  // Render progress table
  function renderProgressTable(progressReports) {
    progressTableBody.innerHTML = "";

    if (progressReports.length === 0) {
      progressTableBody.innerHTML = `<tr><td colspan="5">No progress reports found</td></tr>`;
      return;
    }

    progressReports.forEach((report) => {
      const row = document.createElement("tr");
      const counselingDate = new Date(report.counseling_date);
      const previewText =
        report.description.length > 50
          ? `${report.description.substring(0, 50)}...`
          : report.description;

      row.innerHTML = `
                <td>${counselingDate.toLocaleDateString()}</td>
                <td>${report.counselor_name}</td>
                <td class="notes-preview">${previewText}</td>
                <td>
                    <button class="btn-view" onclick="viewProgressDetails(${
                      report.progressId
                    })">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
      progressTableBody.appendChild(row);
    });
  }

  // View detailed progress report
  window.viewProgressDetails = async function (progressId) {
    try {
      const response = await fetch(
        `http://localhost/Counseling%20System/backend/progress/get_victim_progress.php?progressId=${progressId}`,
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

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      displayProgressModal(result.data);
    } catch (error) {
      console.error("Error fetching progress details:", error);
      alert(error.message || "Failed to load progress details");
    }
  };

  // Display progress details in modal
  function displayProgressModal(progress) {
    const counselingDate = new Date(progress.counseling_date);
    const createdDate = new Date(progress.created_at);

    modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Progress Report #${progress.progressId}</h2>
                <p>Session Date: ${counselingDate.toLocaleDateString()}</p>
                <p>Reported On: ${createdDate.toLocaleString()}</p>
            </div>
            
            <div class="modal-body">
                <div class="user-info">
                    <h3>Client Information</h3>
                    <p><strong>Name:</strong> ${progress.victim_username}</p>
                    <p><strong>Age:</strong> ${progress.victim_age}</p>
                    <p><strong>Occupation:</strong> ${
                      progress.victim_occupation
                    }</p>
                </div>
                
                <div class="counselor-info">
                    <h3>Counselor Information</h3>
                    <div class="counselor-details">
                        <img src="${
                          progress.counselor_photo_url || "default-avatar.jpg"
                        }" 
                             alt="${progress.counselor_name}" 
                             class="counselor-avatar">
                        <div>
                            <p><strong>Name:</strong> ${
                              progress.counselor_name
                            }</p>
                            <p><strong>Profession:</strong> ${
                              progress.counselor_profession
                            }</p>
                            <p><strong>Company:</strong> ${
                              progress.counselor_company
                            }</p>
                            <p><strong>Specialization:</strong> ${
                              progress.counselor_specialization
                            }</p>
                        </div>
                    </div>
                </div>
                
                <div class="progress-notes">
                    <h3>Progress Notes</h3>
                    <div class="notes-content">${progress.description}</div>
                </div>
            </div>
        `;

    progressModal.style.display = "block";
  }
});
