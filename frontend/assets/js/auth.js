document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (!username || !password || !role) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all fields.",
      });
      return;
    }

    // Determine the endpoint based on selected role
    const endpoint =
      role === "counselor"
        ? "http://localhost/Counseling%20System/backend/counselor/login.php"
        : "http://localhost/Counseling%20System/backend/victims/login.php";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.message === "Login successful") {
        // Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", role);

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome, ${data.user.username}`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Redirect based on role if needed
          const redirectUrl =
            role === "counselor" ? "../../index.html" : "../../index.html";
          window.location.href = redirectUrl;
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
      });
    }
  });
