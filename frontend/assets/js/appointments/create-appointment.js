// Global variables
let allCounselors = [];
let currentUser = null;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get current user from localStorage
  const userData = localStorage.getItem("user");
  if (!userData) {
    window.location.href = "login.html";
    return;
  }
  currentUser = JSON.parse(userData);

  // Initialize form
  initForm();

  // Fetch counselors
  fetchCounselors();
});

// Initialize form elements and event listeners
function initForm() {
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("appointmentDate").min = today;

  // Set default time (next full hour)
  const now = new Date();
  const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
  const timeString = nextHour.toTimeString().substring(0, 5);
  document.getElementById("startTime").value = timeString;

  // Calculate end time (1 hour after start)
  const endTime = new Date(nextHour.setHours(nextHour.getHours() + 1));
  const endTimeString = endTime.toTimeString().substring(0, 5);
  document.getElementById("endTime").value = endTimeString;

  // Add event listener for form submission
  document
    .getElementById("appointmentForm")
    .addEventListener("submit", handleAppointmentSubmit);

  // Update end time when start time changes
  document
    .getElementById("startTime")
    .addEventListener("change", updateEndTime);
}

// Update end time based on start time
function updateEndTime() {
  const startTime = document.getElementById("startTime").value;
  if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours + 1, minutes, 0, 0);
    const endTimeString = endTime.toTimeString().substring(0, 5);
    document.getElementById("endTime").value = endTimeString;
  }
}

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
    populateCounselorDropdown();
  } catch (error) {
    console.error("Error fetching counselors:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load counselors",
      text: error.message || "Please try again later",
    });
  }
}

// Populate counselor dropdown
function populateCounselorDropdown() {
  const select = document.getElementById("counselorSelect");

  // Clear existing options except the first one
  while (select.options.length > 1) {
    select.remove(1);
  }

  // Add counselor options
  allCounselors.forEach((counselor) => {
    const option = document.createElement("option");
    option.value = counselor.counselorId;
    option.textContent = `${counselor.name} (${counselor.specialization})`;
    select.appendChild(option);
  });
}

// Handle form submission
async function handleAppointmentSubmit(e) {
  e.preventDefault();

  // Get form values
  const counselorId = document.getElementById("counselorSelect").value;
  const date = document.getElementById("appointmentDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const notes = document.getElementById("appointmentNotes").value;

  // Validate form
  if (!counselorId || !date || !startTime || !endTime) {
    Swal.fire({
      icon: "error",
      title: "Missing Information",
      text: "Please fill in all required fields",
    });
    return;
  }

  // Validate time
  if (startTime >= endTime) {
    Swal.fire({
      icon: "error",
      title: "Invalid Time",
      text: "End time must be after start time",
    });
    return;
  }

  // Create appointment data
  const appointmentData = {
    counselorId: counselorId,
    userId: currentUser.userId || currentUser.counselorId,
    date: date,
    start_time: startTime,
    end_time: endTime,
    notes: notes,
  };

  try {
    // Show loading indicator
    Swal.fire({
      title: "Creating Appointment",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Send request to server
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/appointment_create.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      }
    );

    const result = await response.json();

    if (!response.ok || result.status === "error") {
      throw new Error(result.message || "Failed to create appointment");
    }

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Appointment Created!",
      text: "Your appointment has been successfully scheduled",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "../public/home.html";
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to create appointment. Please try again.",
    });
  }
}
