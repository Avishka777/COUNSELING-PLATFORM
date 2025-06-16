document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const postsContainer = document.getElementById("postsContainer");
  const modal = document.getElementById("postModal");
  const closeModal = document.querySelector(".close-modal");

  // Initialize
  fetchPosts();

  // Close modal when clicking X or outside
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
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

    renderPosts(data.data || data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load posts",
      text: error.message || "Please try again later",
    });
  }
}

// Render posts to the wall
function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet. Be the first to share!</p>
            </div>
        `;
    return;
  }

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post-card";
    postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">
                    ${
                      post.is_anonymous
                        ? "A"
                        : post.author.charAt(0).toUpperCase()
                    }
                </div>
                <div>
                    <div class="post-author">${
                      post.is_anonymous ? "Anonymous" : post.author
                    }</div>
                    <div class="post-meta">
                        ${new Date(
                          post.created_at
                        ).toLocaleString()} • Post ID: ${post.postId}
                    </div>
                </div>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            
            ${
              post.image_url
                ? `
                <img src="${post.image_url}" alt="${post.title}" class="post-image"
                     onclick="viewPostDetails(${post.postId})">
            `
                : ""
            }
            
            <div class="post-description">${post.description}</div>
            
            <div class="post-actions">
                <div class="post-action" onclick="viewPostDetails(${
                  post.postId
                })">
                    <i class="fas fa-eye"></i>
                    <span>View Details</span>
                </div>
                <div class="post-action" onclick="likePost(${post.postId})">
                    <i class="far fa-thumbs-up"></i>
                    <span>Like</span>
                </div>
                <div class="post-action" onclick="commentOnPost(${
                  post.postId
                })">
                    <i class="far fa-comment"></i>
                    <span>Comment</span>
                </div>
            </div>
        `;
    postsContainer.appendChild(postElement);
  });
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

    displayPostModal(data.data || data);
  } catch (error) {
    console.error("Error fetching post details:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load details",
      text: error.message || "Please try again later",
    });
  }
}

// Display post in modal
function displayPostModal(post) {
  const modal = document.getElementById("postModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">
                ${post.is_anonymous ? "A" : post.author.charAt(0).toUpperCase()}
            </div>
            <div>
                <div class="post-author">${
                  post.is_anonymous ? "Anonymous" : post.author
                }</div>
                <div class="post-meta">
                    ${new Date(post.created_at).toLocaleString()} • Post ID: ${
    post.postId
  }
                </div>
            </div>
        </div>
        
        <h2 class="post-title">${post.title}</h2>
        
        ${
          post.image_url
            ? `
            <img src="${post.image_url}" alt="${post.title}" class="modal-post-image">
        `
            : ""
        }
        
        <div class="post-description">${post.description}</div>
        
        <div class="post-comments">
            <h3><i class="fas fa-comments"></i> Comments</h3>
            <div class="comment-list">
                <!-- Comments would be loaded here in a real implementation -->
                <div class="no-comments">No comments yet. Be the first to comment!</div>
            </div>
            
            <div class="add-comment">
                <textarea placeholder="Write a comment..." rows="2"></textarea>
                <button class="btn-post-comment">Post Comment</button>
            </div>
        </div>
    `;

  modal.style.display = "block";
}

// Like post function (placeholder)
function likePost(postId) {
  Swal.fire({
    icon: "success",
    title: "Post liked!",
    showConfirmButton: false,
    timer: 1500,
  });
  // In a real implementation, you would call an API endpoint here
}

// Comment on post function (placeholder)
function commentOnPost(postId) {
  viewPostDetails(postId);
  // This just opens the modal where comments can be added
}
