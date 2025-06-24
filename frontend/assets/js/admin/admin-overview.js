document.addEventListener("DOMContentLoaded", function () {
  loadDashboardData();
  setInterval(loadDashboardData, 300000); // 5 minutes refresh
});

async function loadDashboardData() {
  try {
    await loadCounts();
    await loadRecentAppointments();
    await loadRecentCounselors();

    // Remove chart loading calls completely
    hideChartContainers(); // Add this new function
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showError(
      "Dashboard Error",
      "Failed to load dashboard data. Please try again."
    );
  }
}

// New function to hide chart containers
function hideChartContainers() {
  const chartContainers = [
    document.getElementById("appointmentsChart")?.parentElement,
    document.getElementById("usersChart")?.parentElement,
  ];

  chartContainers.forEach((container) => {
    if (container) {
      container.style.display = "none";
    }
  });
}

// Keep all your existing functions for:
// - loadCounts()
// - loadRecentAppointments()
// - loadRecentCounselors()
// - showLoading()
// - hideLoading()
// - showError()
// - window resize event handler

async function loadDummyAppointmentsChart() {
  // Dummy data for appointments chart
  const dummyData = {
    pending: 15,
    confirmed: 42,
    cancelled: 7,
    completed: 36,
  };

  // Create chart
  const ctx = document.getElementById("appointmentsChart").getContext("2d");

  // Destroy previous chart if exists
  if (window.appointmentsChart) {
    window.appointmentsChart.destroy();
  }

  window.appointmentsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pending", "Confirmed", "Cancelled", "Completed"],
      datasets: [
        {
          data: Object.values(dummyData),
          backgroundColor: ["#FFC107", "#28A745", "#DC3545", "#17A2B8"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "70%",
    },
  });
}

async function loadDummyUsersChart() {
  // Dummy data for users chart (last 30 days)
  const dummyLabels = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Generate random but realistic user signup data
  const dummyData = Array.from({ length: 30 }, (_, i) => {
    // More signups recently, fewer in the past
    const base = Math.max(0, 10 - Math.floor(i / 5));
    return base + (i % 3);
  });

  // Create chart
  const ctx = document.getElementById("usersChart").getContext("2d");

  // Destroy previous chart if exists
  if (window.usersChart) {
    window.usersChart.destroy();
  }

  window.usersChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dummyLabels,
      datasets: [
        {
          label: "New Users",
          data: dummyData,
          backgroundColor: "#3A86FF",
          borderColor: "#2667CC",
          borderWidth: 1,
          borderRadius: 4,
          barThickness: "flex",
          maxBarThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              return `${context.raw} new user${context.raw !== 1 ? "s" : ""}`;
            },
          },
        },
      },
    },
  });
}

async function loadCounts() {
  try {
    // Load victims count
    const victimsRes = await fetch(
      "http://localhost/Counseling%20System/backend/victims/view_all_victim.php"
    );
    const victimsData = await victimsRes.json();
    document.getElementById("victimsCount").textContent =
      victimsData.data.length;

    // Load counselors count
    const counselorsRes = await fetch(
      "http://localhost/Counseling%20System/backend/counselor/view_all_counselors.php"
    );
    const counselorsData = await counselorsRes.json();
    document.getElementById("counselorsCount").textContent =
      counselorsData.data.length;

    // Load appointments count
    const appointmentsRes = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/get_all_appointments.php"
    );
    const appointmentsData = await appointmentsRes.json();
    document.getElementById("appointmentsCount").textContent =
      appointmentsData.data.length;

    // Calculate active sessions (appointments with status 'confirmed' for today)
    const today = new Date().toISOString().split("T")[0];
    const activeSessions = appointmentsData.data.filter(
      (app) => app.status === "confirmed" && app.date === today
    ).length;
    document.getElementById("activeSessions").textContent = activeSessions;
  } catch (error) {
    console.error("Error loading counts:", error);
    throw error;
  }
}

async function loadRecentAppointments() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/get_all_appointments.php"
    );
    const data = await response.json();

    // Sort by date (newest first) and take first 5
    const recentAppointments = data.data
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const tbody = document.querySelector("#recentAppointments tbody");
    tbody.innerHTML = "";

    recentAppointments.forEach((app) => {
      const row = document.createElement("tr");
      const appDate = new Date(app.date);

      row.innerHTML = `
        <td>${app.appointmentId}</td>
        <td>${appDate.toLocaleDateString()}</td>
        <td>${app.user_username} (${app.user_age})</td>
        <td>${app.counselor_name}</td>
        <td><span class="status-badge status-${app.status}">${
        app.status
      }</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading recent appointments:", error);
    throw error;
  }
}

async function loadRecentCounselors() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/counselor/view_all_counselors.php"
    );
    const data = await response.json();

    // Sort by ID (assuming higher IDs are newer) and take first 5
    const recentCounselors = data.data
      .sort((a, b) => b.counselorId - a.counselorId)
      .slice(0, 5);

    const tbody = document.querySelector("#recentCounselors tbody");
    tbody.innerHTML = "";

    recentCounselors.forEach((counselor) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${counselor.counselorId}</td>
        <td>${counselor.name}</td>
        <td>${counselor.current_profession}</td>
        <td>${counselor.specialization || "N/A"}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading recent counselors:", error);
    throw error;
  }
}

async function loadAppointmentsChart() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/appointments/get_all_appointments.php"
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      document.getElementById("appointmentsChart").parentElement.innerHTML = `
        <div class="no-data-message">
          <i class="fas fa-chart-pie"></i>
          <p>No appointment data available</p>
        </div>
      `;
      return;
    }

    // Count appointments by status
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };

    data.data.forEach((app) => {
      const status = app.status.toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    // Create chart
    const ctx = document.getElementById("appointmentsChart").getContext("2d");

    // Destroy previous chart if exists
    if (window.appointmentsChart) {
      window.appointmentsChart.destroy();
    }

    window.appointmentsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pending", "Confirmed", "Cancelled", "Completed"],
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: ["#FFC107", "#28A745", "#DC3545", "#17A2B8"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        cutout: "70%",
      },
    });
  } catch (error) {
    console.error("Error loading appointments chart:", error);
    document.getElementById("appointmentsChart").parentElement.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to load chart data</p>
      </div>
    `;
  }
}

async function loadUsersChart() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/victims/view_all_victim.php"
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      document.getElementById("usersChart").parentElement.innerHTML = `
        <div class="no-data-message">
          <i class="fas fa-chart-bar"></i>
          <p>No user data available</p>
        </div>
      `;
      return;
    }

    // Prepare data for last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });

    // Count users by join date (assuming created_at field exists)
    const usersByDate = {};
    data.data.forEach((user) => {
      const joinDate = user.created_at
        ? user.created_at.split(" ")[0]
        : new Date().toISOString().split("T")[0];
      usersByDate[joinDate] = (usersByDate[joinDate] || 0) + 1;
    });

    const chartData = last30Days.map((date) => usersByDate[date] || 0);
    const chartLabels = last30Days.map((date) =>
      new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );

    // Create chart
    const ctx = document.getElementById("usersChart").getContext("2d");

    // Destroy previous chart if exists
    if (window.usersChart) {
      window.usersChart.destroy();
    }

    window.usersChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "New Users",
            data: chartData,
            backgroundColor: "#3A86FF",
            borderColor: "#2667CC",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: "flex",
            maxBarThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false,
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                return `${context.raw} new user${context.raw !== 1 ? "s" : ""}`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error loading users chart:", error);
    document.getElementById("usersChart").parentElement.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to load chart data</p>
      </div>
    `;
  }
}

// Helper functions
function showLoading() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.innerHTML = `
    <div class="spinner"></div>
    <p>Loading dashboard data...</p>
  `;
  document.body.appendChild(loadingOverlay);
}

function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

function showError(title, message) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#3A86FF",
    allowOutsideClick: false,
  });
}

// Initialize charts when window resizes to maintain responsiveness
window.addEventListener("resize", function () {
  if (window.appointmentsChart) {
    window.appointmentsChart.resize();
  }
  if (window.usersChart) {
    window.usersChart.resize();
  }
});
