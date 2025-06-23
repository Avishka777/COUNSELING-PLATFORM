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

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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

    // Create a temporary element to store the full description
    const tempDesc = document.createElement("div");
    tempDesc.textContent = post.description;
    const escapedDescription = tempDesc.innerHTML;

    postElement.innerHTML = `
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
            
            <h3 class="post-title">${post.title}</h3>
            
            ${
              post.image_url
                ? `
              <img src="${post.image_url}" alt="${post.title}" class="post-image"
                   onclick="viewPostDetails(${post.postId})">
            `
                : ""
            }
            
            <div class="post-description short" id="desc-${post.postId}">
              ${truncateText(post.description, 200)}
            </div>
            ${
              post.description.length > 200
                ? `
              <div class="see-more" onclick="toggleDescription(${post.postId})">
                See more
              </div>
            `
                : ""
            }
            
            <div class="post-actions">
              <div class="post-action" onclick="likePost(${post.postId})">
                <i class="far fa-thumbs-up"></i>
                <span>Like</span>
              </div>
              <div class="post-action" onclick="commentOnPost(${post.postId})">
                <i class="far fa-comment"></i>
                <span>Comment</span>
              </div>
            </div>
          `;

    // Store the full description in a data attribute
    if (post.description.length > 200) {
      const seeMoreBtn = postElement.querySelector(".see-more");
      seeMoreBtn.dataset.fullText = escapedDescription;
    }

    postsContainer.appendChild(postElement);
  });
}

function toggleDescription(postId) {
  const descEl = document.getElementById(`desc-${postId}`);
  const seeMoreEl = descEl.nextElementSibling;
  const fullText = seeMoreEl.dataset.fullText;

  if (descEl.classList.contains("short")) {
    descEl.innerHTML = fullText.replace(/\n/g, "<br>");
    descEl.classList.remove("short");
    seeMoreEl.textContent = "See less";
  } else {
    descEl.textContent = truncateText(fullText, 200);
    descEl.classList.add("short");
    seeMoreEl.textContent = "See more";
  }
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
   <div class="modal-comments">
      <h3><i class="fas fa-comments"></i> Comments</h3>
      <div class="comment-list">
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
