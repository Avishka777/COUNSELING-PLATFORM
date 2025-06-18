document.addEventListener("DOMContentLoaded", function () {
  // Initialize Select2
  $("#victimSelect").select2();

  // Get logged-in user data
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData || !userData.counselorId) {
    showError(
      "Authentication Error",
      "Please log in as a counselor to continue"
    );
    return;
  }

  // Load victims from counselor's appointments
  loadVictimsFromAppointments(userData.counselorId);

  // Form submission handler
  document
    .getElementById("progressForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {
        victimId: document.getElementById("victimSelect").value,
        counselorId: userData.counselorId, // From localStorage
        description: document.getElementById("progressDescription").value,
        counseling_date: document.getElementById("progressDate").value,
      };

      try {
        const response = await fetch(
          "http://localhost/Counseling%20System/backend/progress/create_progress.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const result = await response.json();

        if (!response.ok || result.status === "error") {
          throw new Error(result.message || "Failed to create progress record");
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Progress record created successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "../appointments/counselor-appointments.html";
        });
      } catch (error) {
        console.error("Error creating progress:", error);
        showError("Error", error.message || "Failed to create progress record");
      }
    });
});

async function loadVictimsFromAppointments(counselorId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/appointments/get_counselor_appointments.php?counselorId=${counselorId}`,
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

    const victimSelect = document.getElementById("victimSelect");
    victimSelect.innerHTML = '<option value="">Select a client</option>';

    // Create a map to avoid duplicates
    const uniqueVictims = new Map();

    data.data.forEach((appointment) => {
      if (!uniqueVictims.has(appointment.userId)) {
        uniqueVictims.set(appointment.userId, appointment);
        const option = document.createElement("option");
        option.value = appointment.userId;
        option.textContent = `${appointment.user_username} (Age: ${appointment.user_age}, ${appointment.user_occupation})`;
        victimSelect.appendChild(option);
      }
    });

    // Enable the select if we have options
    if (uniqueVictims.size > 0) {
      victimSelect.disabled = false;
    } else {
      victimSelect.innerHTML = '<option value="">No clients found</option>';
    }
  } catch (error) {
    console.error("Error loading victims:", error);
    showError("Error", "Failed to load clients from appointments");
  }
}

function showError(title, message) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  });
}

// Set default date to today
document.getElementById("progressDate").valueAsDate = new Date();
