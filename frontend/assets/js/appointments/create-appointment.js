// Global variables
let allCounselors = [];
let currentUser = null;
let selectedCounselor = null;
let counselorAvailability = {};

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

  // Add event listeners
  document
    .getElementById("appointmentForm")
    .addEventListener("submit", handleAppointmentSubmit);
  document
    .getElementById("counselorSelect")
    .addEventListener("change", handleCounselorSelect);
  document
    .getElementById("appointmentDate")
    .addEventListener("change", handleDateSelect);
}

// Handle counselor selection
async function handleCounselorSelect(e) {
  const counselorId = e.target.value;
  selectedCounselor = allCounselors.find((c) => c.counselorId == counselorId);

  if (!selectedCounselor) return;

  // Fetch counselor availability
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/counselor/view_counselor.php?counselorId=${counselorId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      counselorAvailability = data.availability;
      updateTimeSlots();
    } else {
      throw new Error(data.error || "Failed to load availability");
    }
  } catch (error) {
    console.error("Error fetching availability:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load availability",
      text: error.message || "Please try again later",
    });
  }
}

// Handle date selection
function handleDateSelect() {
  if (selectedCounselor) {
    updateTimeSlots();
  }
}

// Update available time slots based on selected date and counselor availability
function updateTimeSlots() {
  const dateInput = document.getElementById("appointmentDate");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");

  if (!dateInput.value || !selectedCounselor) return;

  // Get day of week from selected date
  const date = new Date(dateInput.value);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

  // Get available slots for this day
  const availableSlots = counselorAvailability[dayOfWeek] || [];

  if (availableSlots.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Availability",
      text: `This counselor is not available on ${dayOfWeek}s`,
    });
    startTimeInput.value = "";
    endTimeInput.value = "";
    return;
  }

  // Create time slot options
  let timeOptions = [];
  availableSlots.forEach((slot) => {
    const start = new Date(`2000-01-01T${slot.start_time}`);
    const end = new Date(`2000-01-01T${slot.end_time}`);

    // Create 30-minute intervals within each availability slot
    for (
      let time = start;
      time < end;
      time.setMinutes(time.getMinutes() + 30)
    ) {
      const timeStr = time.toTimeString().substr(0, 5);
      timeOptions.push(timeStr);
    }
  });

  // Update start time input with available slots
  startTimeInput.innerHTML = "";
  timeOptions.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    startTimeInput.appendChild(option);
  });

  // Auto-select first available time and set end time
  if (timeOptions.length > 0) {
    startTimeInput.value = timeOptions[0];
    updateEndTime();
  }
}

// Update end time based on start time and availability
function updateEndTime() {
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const dateInput = document.getElementById("appointmentDate");

  if (!startTimeInput.value || !dateInput.value || !selectedCounselor) return;

  // Get day of week from selected date
  const date = new Date(dateInput.value);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

  // Find the availability slot that contains the selected start time
  const availabilitySlot = (counselorAvailability[dayOfWeek] || []).find(
    (slot) => {
      return (
        startTimeInput.value >= slot.start_time &&
        startTimeInput.value < slot.end_time
      );
    }
  );

  if (!availabilitySlot) {
    endTimeInput.value = "";
    return;
  }

  // Calculate possible end times (30, 60, 90 minutes)
  const startTime = new Date(`2000-01-01T${startTimeInput.value}:00`);
  const slotEndTime = new Date(`2000-01-01T${availabilitySlot.end_time}:00`);

  const possibleDurations = [30, 60, 90]; // minutes
  let validEndTimes = [];

  possibleDurations.forEach((duration) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    if (endTime <= slotEndTime) {
      validEndTimes.push(endTime.toTimeString().substr(0, 5));
    }
  });

  // Update end time options
  endTimeInput.innerHTML = "";
  validEndTimes.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    endTimeInput.appendChild(option);
  });

  // Auto-select first available end time
  if (validEndTimes.length > 0) {
    endTimeInput.value = validEndTimes[0];
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

  // Validate against counselor availability
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const isTimeValid = (counselorAvailability[dayOfWeek] || []).some((slot) => {
    return startTime >= slot.start_time && endTime <= slot.end_time;
  });

  if (!isTimeValid) {
    Swal.fire({
      icon: "error",
      title: "Invalid Time Slot",
      text: "The selected time is not within the counselor's availability",
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
