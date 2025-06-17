document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const userData = localStorage.getItem("user");

  if (!userData) {
    window.location.href = "../auth/login.html";
    return;
  }

  // Image preview functionality
  const imageInput = document.getElementById("image");
  const previewImage = document.getElementById("previewImage");
  const noImageText = document.getElementById("noImageText");

  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
        noImageText.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.style.display = "none";
      noImageText.style.display = "block";
    }
  });

  // Form submission
  document
    .getElementById("postForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const isAnonymous = document.getElementById("isAnonymous").checked;
      const imageFile = imageInput.files[0];

      // Basic validation
      if (!title || !description) {
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Please fill in all required fields",
        });
        return;
      }

      try {
        // Prepare the data
        const postData = {
          title: title,
          description: description,
          is_anonymous: isAnonymous,
        };

        // Set either userId or counselorId based on who is logged in
        if (userData) {
          const user = JSON.parse(userData);
          if (user.counselorId) {
            postData.counselorId = user.counselorId; 
          } else if (user.userId) {
            postData.userId = user.userId; 
          }
        }

        // Handle image if selected
        if (imageFile) {
          const base64Image = await convertToBase64(imageFile);
          postData.image = base64Image;
        }

        // Submit to server
        const response = await fetch(
          "http://localhost/Counseling%20System/backend/posts/create_post.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          }
        );

        const result = await response.json();

        if (result.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Post Created!",
            text: "Your post has been published successfully",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "../public/community.html";
          });
        } else {
          throw new Error(result.message || "Failed to create post");
        }
      } catch (error) {
        console.error("Error creating post:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong. Please try again.",
        });
      }
    });

  // Convert image file to base64
  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
});
