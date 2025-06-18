// Main JavaScript file for shared functionality
document.addEventListener("DOMContentLoaded", function () {
  // Common functionality across all pages

  // Mobile menu toggle (if needed)
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Any other shared JavaScript functionality
});

document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("userRole");
  const loginBtn = document.getElementById("login-button");
  const dropdown = document.getElementById("user-dropdown");
  const dropdownItems = document.getElementById("dropdown-items");

  if (userRole) {
    // Hide login button
    loginBtn?.classList.add("hidden");

    // Show dropdown
    dropdown.classList.remove("hidden");

    // Add profile link
    const profileLink = document.createElement("a");

    dropdownItems.appendChild(profileLink);

    // If admin, add dashboard link
    if (userRole === "admin") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../admin/all-victims.html";
      dashboardLink.textContent = "Dashboard";
      dropdownItems.appendChild(dashboardLink);
    }

    // If admin, add dashboard link
    if (userRole === "admin" || userRole === "victim") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../appointments/create-appointment.html";
      dashboardLink.textContent = "Make an Appointment";
      dropdownItems.appendChild(dashboardLink);
    }

     // If admin, add dashboard link
    if (userRole === "admin" || userRole === "victim") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../appointments/my-appointments.html";
      dashboardLink.textContent = "My Appointments";
      dropdownItems.appendChild(dashboardLink);
    }

    // If admin or victim, add dashboard link
    if (userRole === "admin" || userRole === "victim") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../auth/victim-profile.html";
      dashboardLink.textContent = "My Profile";
      dropdownItems.appendChild(dashboardLink);
    }

    // If counselor, add dashboard link
    if (userRole === "counselor") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../auth/counselor-profile.html";
      dashboardLink.textContent = "My Profile";
      dropdownItems.appendChild(dashboardLink);
    }

    // for all users, add dashboard link
    if (userRole === "counselor" || userRole === "admin" || userRole === "victim") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "../posts/my-posts.html";
      dashboardLink.textContent = "My Posts";
      dropdownItems.appendChild(dashboardLink);
    }

    // Add logout link
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Logout";
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.clear(); // clear all local storage keys
      location.reload(); // reload page
    });
    dropdownItems.appendChild(logoutLink);
  }

  // Toggle dropdown visibility on button click
  document.querySelector(".dropdown-toggle")?.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
});

// Simple animation trigger
document.addEventListener("DOMContentLoaded", function () {
  const animateElements = document.querySelectorAll(".animate-fade");

  animateElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 200);
  });

  // Mobile menu toggle
  const mobileMenu = document.getElementById("mobile-menu");
  const navList = document.querySelector(".nav-list");

  mobileMenu.addEventListener("click", function () {
    this.classList.toggle("active");
    navList.classList.toggle("active");
  });
});
