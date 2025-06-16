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
    profileLink.href = "pages/auth/profile.html";
    profileLink.textContent = "Profile";
    dropdownItems.appendChild(profileLink);

    // If admin, add dashboard
    if (userRole === "admin") {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "pages/admin/all-posts.html";
      dashboardLink.textContent = "Dashboard";
      dropdownItems.appendChild(dashboardLink);
    }
  }

  // Toggle dropdown visibility on button click
  document.querySelector(".dropdown-toggle")?.addEventListener("click", () => {
    dropdown.classList.toggle("show");
  });

  // Optional: Close dropdown when clicking outside
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
