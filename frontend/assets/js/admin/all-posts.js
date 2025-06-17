// Global variables
let allPosts = [];
const postsPerPage = 10;
let currentPage = 1;
let currentEditingPost = null;
let newImageFile = null;

// Define imageInput globally
const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";
imageInput.style.display = "none";
document.body.appendChild(imageInput);

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const modal = document.getElementById("postModal");
  const closeModal = document.querySelector(".close-modal");
  const searchInput = document.getElementById("postSearch");

  // Image upload elements
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.style.display = "none";
  document.body.appendChild(imageInput);

  // Initialize
  fetchPosts();

  // Event Listeners
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    filterPosts(searchTerm);
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  document.getElementById("prevPage").addEventListener("click", goToPrevPage);
  document.getElementById("nextPage").addEventListener("click", goToNextPage);
});

// Fetch posts from API
async function fetchPosts() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/posts/get_posts.php",
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

    allPosts = data.data || data;
    renderPosts();
    updatePagination();
  } catch (error) {
    console.error("Error fetching posts:", error);
    showError(
      "Failed to load posts",
      error.message || "Please try again later"
    );
  }
}

// Render posts to the table
function renderPosts(posts = allPosts) {
  const tableBody = document.querySelector("#postsTable tbody");
  tableBody.innerHTML = "";

  const startIdx = (currentPage - 1) * postsPerPage;
  const endIdx = startIdx + postsPerPage;
  const paginatedPosts = posts.slice(startIdx, endIdx);

  if (paginatedPosts.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-results">No posts found</td>
            </tr>
        `;
    return;
  }

  paginatedPosts.forEach((post) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${post.postId}</td>
            <td>${
              post.title.length > 50
                ? post.title.substring(0, 50) + "..."
                : post.title
            }</td>
            <td>${post.is_anonymous ? "Anonymous" : post.author}</td>
            <td>${new Date(post.created_at).toLocaleDateString()}</td>
            <td class="actions">
                <button class="btn-view" onclick="viewPostDetails(${
                  post.postId
                })">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-edit" onclick="editPost(${post.postId})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="confirmDeletePost(${
                  post.postId
                }, '${escapeHTML(post.title)}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Update showing count
  document.getElementById("showingCount").textContent = paginatedPosts.length;
  document.getElementById("totalCount").textContent = posts.length;
}

// Filter posts based on search term
function filterPosts(searchTerm) {
  if (!searchTerm) {
    renderPosts();
    return;
  }

  const filteredPosts = allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm) ||
      (post.author &&
        !post.is_anonymous &&
        post.author.toLowerCase().includes(searchTerm)) ||
      post.postId.toString().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm)
  );

  renderPosts(filteredPosts);
}

// Pagination functions
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPosts();
    updatePagination();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPosts();
    updatePagination();
  }
}

function updatePagination() {
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === totalPages || totalPages === 0;
}

// View post details in modal
async function viewPostDetails(postId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/posts/get_post.php?id=${postId}`,
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

    const post = data.data || data;
    displayPostModal(post, false);
  } catch (error) {
    console.error("Error fetching post details:", error);
    showError(
      "Failed to load details",
      error.message || "Please try again later"
    );
  }
}

// Edit post - load into modal in edit mode
async function editPost(postId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/posts/get_post.php?id=${postId}`,
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

    const post = data.data || data;
    currentEditingPost = post;
    displayPostModal(post, true);
  } catch (error) {
    console.error("Error fetching post for editing:", error);
    showError(
      "Failed to load post for editing",
      error.message || "Please try again later"
    );
  }
}

// Display post details in modal (view or edit mode)
function displayPostModal(post, isEditMode = false) {
  const modal = document.getElementById("postModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (isEditMode) {
    modalTitle.textContent = `Edit Post: ${post.title}`;

    // Construct edit form with image upload
    modalBody.innerHTML = `
            <form id="editPostForm">
                <input type="hidden" name="postId" value="${post.postId}">
                
                <div class="form-group">
                    <label for="editTitle">Title</label>
                    <input type="text" id="editTitle" name="title" value="${escapeHTML(
                      post.title
                    )}" required>
                </div>
                
                <div class="form-group">
                    <label for="editDescription">Description</label>
                    <textarea id="editDescription" name="description" rows="6" required>${escapeHTML(
                      post.description
                    )}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Current Image</label>
                    <div class="image-preview-container">
                        ${
                          post.image_url
                            ? `<img src="${post.image_url}" class="current-image" id="currentImage">
                               <button type="button" class="btn-remove-image" onclick="removeImage()">Remove Image</button>`
                            : '<div class="no-image">No image</div>'
                        }
                    </div>
                    <button type="button" class="btn-upload-image" onclick="triggerImageUpload()">
                        ${post.image_url ? "Change Image" : "Add Image"}
                    </button>
                </div>
                
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="editAnonymous" name="is_anonymous" ${
                      post.is_anonymous ? "checked" : ""
                    }>
                    <label for="editAnonymous">Anonymous Post</label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="displayPostModal(currentEditingPost, false)">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        `;

    // Add form submit handler
    document
      .getElementById("editPostForm")
      .addEventListener("submit", handlePostUpdate);

    // Initialize image preview
    newImageFile = null;
  } else {
    modalTitle.textContent = `Post Details: ${post.title}`;

    // Construct view HTML
    const imageHtml = post.image_url
      ? `<img src="${post.image_url}" alt="${post.title}" class="post-image">`
      : `<div class="no-image">No image available</div>`;

    modalBody.innerHTML = `
            <div class="post-details">
                <div class="post-image-container">
                    ${imageHtml}
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <div class="post-meta-item">
                            <i class="fas fa-user"></i>
                            <span>${
                              post.is_anonymous ? "Anonymous" : post.author
                            }</span>
                        </div>
                        <div class="post-meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${new Date(
                              post.created_at
                            ).toLocaleDateString()}</span>
                        </div>
                        <div class="post-meta-item">
                            <i class="fas fa-id-card"></i>
                            <span>Post ID: ${post.postId}</span>
                        </div>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-description">${post.description}</div>
                </div>
            </div>
        `;
  }

  modal.style.display = "block";
}

// Handle image upload trigger
function triggerImageUpload() {
  imageInput.click();
  imageInput.onchange = async function (e) {
    const file = e.target.files[0];
    if (file) {
      newImageFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = function (e) {
        const currentImage = document.getElementById("currentImage");
        if (currentImage) {
          currentImage.src = e.target.result;
        } else {
          const container = document.querySelector(".image-preview-container");
          container.innerHTML = `
            <img src="${e.target.result}" class="current-image" id="currentImage">
            <button type="button" class="btn-remove-image" onclick="removeImage()">Remove Image</button>
          `;
        }
      };
      reader.readAsDataURL(file);
    }
  };
}

// Remove image from post
function removeImage() {
  newImageFile = null;
  const container = document.querySelector(".image-preview-container");
  container.innerHTML = '<div class="no-image">Image will be removed</div>';
}

// Handle post update form submission
async function handlePostUpdate(e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    postId: form.postId.value,
    title: form.title.value,
    description: form.description.value,
    is_anonymous: form.is_anonymous.checked,
  };

  // Add image if a new one was selected
  if (newImageFile) {
    try {
      const base64Image = await convertToBase64(newImageFile);
      formData.image = base64Image;
    } catch (error) {
      console.error("Error converting image:", error);
      showError("Image Error", "Failed to process image. Please try again.");
      return;
    }
  } else if (
    document.querySelector(".no-image") &&
    document.querySelector(".no-image").textContent === "Image will be removed"
  ) {
    // Explicitly set image to null if user clicked remove
    formData.image = "";
  }

  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/posts/update_post.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (!response.ok || result.status === "error") {
      throw new Error(result.message || "Failed to update post");
    }

    showSuccess("Post updated successfully", () => {
      modal.style.display = "none";
      fetchPosts(); // Refresh the posts list
    });
  } catch (error) {
    console.error("Error updating post:", error);
    showError(
      "Update Failed",
      error.message || "Could not update post. Please try again."
    );
  }
}

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

// Confirm and delete post
function confirmDeletePost(postId, title) {
  Swal.fire({
    title: "Confirm Delete",
    html: `Are you sure you want to delete post <strong>"${title}"</strong> (ID: ${postId})?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deletePost(postId);
    }
  });
}

// Delete post
async function deletePost(postId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/posts/delete_post.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: postId }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      showSuccess(
        result.message || `Post ID ${postId} has been deleted successfully`,
        () => {
          fetchPosts(); // Refresh the posts list
        }
      );
    } else {
      throw new Error(result.message || "Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    showError(
      "Delete Failed",
      error.message || "Could not delete post. Please try again."
    );
  }
}

// Helper functions
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );
}

function showError(title, message, callback) {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
  }).then(() => {
    if (callback) callback();
  });
}

function showSuccess(message, callback) {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  }).then(() => {
    if (callback) callback();
  });
}
