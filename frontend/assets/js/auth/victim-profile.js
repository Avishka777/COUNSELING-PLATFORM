document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profileForm");
  const deleteBtn = document.getElementById("deleteBtn");

  // Load user data
  loadUserData();

  // Form submission handler
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    updateProfile();
  });

  // Delete button handler
  deleteBtn.addEventListener("click", function () {
    confirmDelete();
  });

  async function loadUserData() {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.userId) {
        throw new Error("User not logged in");
      }

      const response = await fetch(
        `http://localhost/Counseling%20System/backend/victims/view_victim.php?userId=${userData.userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Populate form fields
      document.getElementById("userId").value = data.userId;
      document.getElementById("username").value = data.username;
      document.getElementById("age").value = data.age || "";
      document.getElementById("occupation").value = data.occupation || "";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load profile data",
      }).then(() => {
        window.location.href = "../auth/login.html";
      });
    }
  }

  async function updateProfile() {
    try {
      const formData = {
        userId: document.getElementById("userId").value,
        username: document.getElementById("username").value,
        age: document.getElementById("age").value,
        occupation: document.getElementById("occupation").value,
        currentPassword: document.getElementById("currentPassword").value,
        newPassword: document.getElementById("newPassword").value,
        confirmPassword: document.getElementById("confirmPassword").value,
      };

      // Validate passwords if changing
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error("Current password is required to change password");
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
      }

      const response = await fetch(
        "http://localhost/Counseling%20System/backend/victims/update_victim.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to update profile");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Profile updated successfully!",
        timer: 2000,
      });

      // Clear password fields
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Could not update profile. Please try again.",
      });
    }
  }

  function confirmDelete() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#7f8c8d",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProfile();
      }
    });
  }

  async function deleteProfile() {
    try {
      const userId = document.getElementById("userId").value;

      const response = await fetch(
        `http://localhost/Counseling%20System/backend/victims/delete_victim.php?id=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to delete profile");
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your account has been deleted.",
        timer: 2000,
      }).then(() => {
        localStorage.removeItem("user");
        window.location.href = "../../index.html";
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message || "Could not delete account. Please try again.",
      });
    }
  }
});
