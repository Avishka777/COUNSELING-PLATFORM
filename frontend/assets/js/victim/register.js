document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const age = document.getElementById("age").value.trim();
    const occupation = document.getElementById("occupation").value.trim();

    // Simple client-side validation
    if (!username || !password || !age || !occupation) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Counseling%20System/backend/victims/register_victims.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            age: parseInt(age),
            occupation,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Registered Successfully!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "../auth/login.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again.",
      });
    }
  });
