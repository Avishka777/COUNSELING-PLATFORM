document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter both username and password.",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Counseling%20System/backend/victims/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.message === "Login successful") {
        // Save user info to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome, ${data.user.username}`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "../../index.html";
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
