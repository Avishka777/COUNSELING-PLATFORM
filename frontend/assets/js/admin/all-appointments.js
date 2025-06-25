// Global variables
let allAppointments = [];
let filteredAppointments = [];
const appointmentsPerPage = 10;
let currentPage = 1;
let currentEditingAppointment = null;

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const modal = document.getElementById("appointmentModal");
  const closeModal = document.querySelector(".close-modal");
  const searchInput = document.getElementById("appointmentSearch");

  // Initialize
  fetchAppointments();

  // Event Listeners
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    filterAppointments(searchTerm);
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
  document
    .getElementById("dateFilter")
    .addEventListener("change", applyFilters);
  document
    .getElementById("clearDateFilter")
    .addEventListener("click", clearDateFilter);
});

// Function to apply all filters (search + date)
function applyFilters() {
  const searchTerm = document
    .getElementById("appointmentSearch")
    .value.toLowerCase();
  const dateFilter = document.getElementById("dateFilter").value;

  filteredAppointments = allAppointments.filter((appointment) => {
    // Search filter
    const matchesSearch =
      appointment.user_username.toLowerCase().includes(searchTerm) ||
      appointment.counselor_name.toLowerCase().includes(searchTerm) ||
      appointment.appointmentId.toString().includes(searchTerm) ||
      appointment.status.toLowerCase().includes(searchTerm) ||
      appointment.date.includes(searchTerm);

    // Date filter
    const matchesDate = dateFilter ? appointment.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  currentPage = 1; // Reset to first page when filters change
  renderAppointments();
  updatePagination();
}

// Clear date filter
function clearDateFilter() {
  document.getElementById("dateFilter").value = "";
  applyFilters();
}

// Fetch appointments from API
async function fetchAppointments() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/get_all_appointments.php",
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

    allAppointments = data.data || data;
    filteredAppointments = [...allAppointments]; // Initialize filtered list
    renderAppointments();
    updatePagination();
  } catch (error) {
    console.error("Error fetching appointments:", error);
    showError(
      "Failed to load appointments",
      error.message || "Please try again later"
    );
  }
}

// Render appointments to the table
function renderAppointments(appointments = allAppointments) {
  const tableBody = document.querySelector("#appointmentsTable tbody");
  tableBody.innerHTML = "";

  const startIdx = (currentPage - 1) * appointmentsPerPage;
  const endIdx = startIdx + appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIdx, endIdx);

  if (paginatedAppointments.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">No appointments found</td>
            </tr>
        `;
    return;
  }

  paginatedAppointments.forEach((appointment) => {
    const row = document.createElement("tr");
    const startTime = new Date(`2000-01-01T${appointment.start_time}`);
    const endTime = new Date(`2000-01-01T${appointment.end_time}`);

    row.innerHTML = `
            <td>${appointment.appointmentId}</td>
            <td>${new Date(appointment.date).toLocaleDateString()}</td>
            <td>${startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}</td>
            <td>${appointment.user_username} (${appointment.user_age})</td>
            <td>${appointment.counselor_name}</td>
            <td><span class="status-badge status-${appointment.status}">${appointment.status
      }</span></td>
            <td class="actions">
                <button class="btn-view" onclick="viewAppointmentDetails(${appointment.appointmentId
      })">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-status" onclick="changeAppointmentStatus(${appointment.appointmentId
      }, '${appointment.status}')">
                    <i class="fas fa-sync-alt"></i> Status
                </button>
                <button class="btn-delete" onclick="confirmDeleteAppointment(${appointment.appointmentId
      })">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Update showing count
  document.getElementById("showingCount").textContent =
    paginatedAppointments.length;
  document.getElementById("totalCount").textContent = appointments.length;
}

// Filter appointments based on search term
function filterAppointments(searchTerm) {
  applyFilters();
}

// Pagination functions
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderAppointments();
    updatePagination();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(allAppointments.length / appointmentsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderAppointments();
    updatePagination();
  }
}

function updatePagination() {
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === totalPages || totalPages === 0;
}

// View appointment details in modal
async function viewAppointmentDetails(appointmentId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/appointments/get_appointment.php?id=${appointmentId}`,
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

    const appointment = data.data || data;
    displayAppointmentModal(appointment);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    showError(
      "Failed to load details",
      error.message || "Please try again later"
    );
  }
}

// Display appointment details in modal (view or edit mode)
function displayAppointmentModal(appointment, isEditMode = false) {
  const modal = document.getElementById("appointmentModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (isEditMode) {
    modalTitle.textContent = `Edit Appointment: #${appointment.appointmentId}`;

    const startTime = appointment.start_time.substring(0, 5); // Format HH:MM
    const endTime = appointment.end_time.substring(0, 5);

    modalBody.innerHTML = `
      <form id="editAppointmentForm">
        <input type="hidden" name="appointmentId" value="${appointment.appointmentId
      }">
        
        <div class="appointment-section">
          <h3>Appointment Information</h3>
          <div class="form-group">
            <label for="editDate">Date</label>
            <input type="date" id="editDate" name="date" 
                   value="${appointment.date}" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="editStartTime">Start Time</label>
              <input type="time" id="editStartTime" name="start_time" 
                     value="${startTime}" required>
            </div>
            
            <div class="form-group">
              <label for="editEndTime">End Time</label>
              <input type="time" id="editEndTime" name="end_time" 
                     value="${endTime}" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="editStatus">Status</label>
            <select id="editStatus" name="status" class="form-control">
              <option value="pending" ${appointment.status === "pending" ? "selected" : ""
      }>Pending</option>
              <option value="confirmed" ${appointment.status === "confirmed" ? "selected" : ""
      }>Confirmed</option>
              <option value="cancelled" ${appointment.status === "cancelled" ? "selected" : ""
      }>Cancelled</option>
              <option value="completed" ${appointment.status === "completed" ? "selected" : ""
      }>Completed</option>
            </select>
          </div>
        </div>
        
        <div class="appointment-section">
          <h3>Notes</h3>
          <div class="form-group">
            <textarea id="editNotes" name="notes" rows="4" 
                      class="form-control">${appointment.notes || ""}</textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-cancel" 
                  onclick="displayAppointmentModal(currentEditingAppointment, false)">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    `;

    // Add form submit handler
    document
      .getElementById("editAppointmentForm")
      .addEventListener("submit", handleAppointmentUpdate);

    // Store the current appointment for reference
    currentEditingAppointment = appointment;
  } else {
    modalTitle.textContent = `Appointment Details: #${appointment.appointmentId}`;

    const startTime = new Date(`2000-01-01T${appointment.start_time}`);
    const endTime = new Date(`2000-01-01T${appointment.end_time}`);
    const formattedTime = `${startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const counselorPhoto = appointment.counselor_photo_url
      ? `<img src="${appointment.counselor_photo_url}" alt="${appointment.counselor_name}" class="counselor-avatar">`
      : `<div class="no-avatar"><i class="fas fa-user-tie"></i></div>`;

    modalBody.innerHTML = `
      <div class="appointment-details">
        <div class="appointment-section">
          <h3>Appointment Information</h3>
          <div class="detail-row">
            <div class="detail-label">ID:</div>
            <div class="detail-value">${appointment.appointmentId}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${new Date(
      appointment.date
    ).toLocaleDateString()}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${formattedTime}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${appointment.status
      }">${appointment.status}</span></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Created At:</div>
            <div class="detail-value">${new Date(
        appointment.created_at
      ).toLocaleString()}</div>
          </div>
        </div>

        <div class="appointment-section">
          <h3>User Information</h3>
          <div class="user-info">
            <div class="user-details">
              <div class="user-name">${appointment.user_username}</div>
              <div class="user-meta">
                <div>Age: ${appointment.user_age}</div>
                <div>Occupation: ${appointment.user_occupation || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="appointment-section">
          <h3>Counselor Information</h3>
          <div class="counselor-info">
            ${counselorPhoto}
            <div class="counselor-details">
              <div class="counselor-name">${appointment.counselor_name}</div>
              <div class="counselor-meta">
                <div>Profession: ${appointment.counselor_profession}</div>
                <div>Company: ${appointment.counselor_company}</div>
                <div>Specialization: ${appointment.specialization || "N/A"
      }</div>
              </div>
            </div>
          </div>
        </div>

        ${appointment.notes
        ? `
        <div class="appointment-section">
          <h3>Notes</h3>
          <div class="notes-content">${appointment.notes}</div>
        </div>
        `
        : ""
      }

        <div class="form-actions">
          <button type="button" class="btn btn-edit" 
                  onclick="displayAppointmentModal(currentEditingAppointment, true)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button type="button" class="btn btn-cancel" 
                  onclick="document.getElementById('appointmentModal').style.display='none'">
            Close
          </button>
        </div>
      </div>
    `;

    // Store the current appointment for reference
    currentEditingAppointment = appointment;
  }

  modal.style.display = "block";
}

// Handle appointment update form submission
async function handleAppointmentUpdate(e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    appointmentId: form.appointmentId.value,
    date: form.date.value,
    start_time: form.start_time.value,
    end_time: form.end_time.value,
    status: form.status.value,
    notes: form.notes.value,
  };

  // Validate time
  if (formData.start_time >= formData.end_time) {
    showError("Invalid Time", "End time must be after start time");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/update_appointment.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (!response.ok || result.status === "error") {
      throw new Error(result.message || "Failed to update appointment");
    }

    showSuccess("Appointment updated successfully", () => {
      modal.style.display = "none";
      fetchAppointments(); // Refresh the appointments list
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    showError(
      "Update Failed",
      error.message || "Could not update appointment. Please try again."
    );
  }
}

// Update the changeAppointmentStatus function to use the modal editor
async function changeAppointmentStatus(appointmentId, currentStatus) {
  try {
    // First fetch the current appointment data
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/appointments/get_appointment.php?id=${appointmentId}`,
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

    const appointment = data.data || data;

    // Display in edit mode
    displayAppointmentModal(appointment, true);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    showError(
      "Failed to load appointment",
      error.message || "Please try again later"
    );
  }
}

// Confirm and delete appointment
function confirmDeleteAppointment(appointmentId) {
  Swal.fire({
    title: "Confirm Delete",
    html: `Are you sure you want to delete appointment <strong>#${appointmentId}</strong>?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteAppointment(appointmentId);
    }
  });
}

// Delete appointment
async function deleteAppointment(appointmentId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/appointments/delete_appointment.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId: appointmentId }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      showSuccess(
        result.message ||
        `Appointment #${appointmentId} has been deleted successfully`,
        () => {
          fetchAppointments(); // Refresh the appointments list
        }
      );
    } else {
      throw new Error(result.message || "Failed to delete appointment");
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    showError(
      "Delete Failed",
      error.message || "Could not delete appointment. Please try again."
    );
  }
}

// Helper functions
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }[tag])
  );
}

function showError(title, message, callback) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  }).then(() => {
    if (callback) callback();
  });
}

function showSuccess(message, callback) {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    if (callback) callback();
  });
}
