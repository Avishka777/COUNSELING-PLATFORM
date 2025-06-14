document
  .getElementById("counselorForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Client-side validation
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const name = document.getElementById("name").value.trim();
    const photo = document.getElementById("photo").files[0];
    const description = document.getElementById("description").value.trim();

    if (!username || !password || !name || !photo || !description) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (description.length < 20) {
      Swal.fire({
        icon: "warning",
        title: "Description Too Short",
        text: "Please provide a more detailed description (at least 20 characters).",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Counseling%20System/backend/counselor/register_counselors.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: result.message || "Counselor registered successfully!",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          form.reset();
          window.location.href = "../auth/login.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          html:
            result.message ||
            (result.errors
              ? result.errors.join("<br>")
              : "Registration failed. Please try again."),
        });
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
      });
    }
  });
