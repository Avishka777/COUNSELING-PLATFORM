document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const modal = document.getElementById("postModal");
    const closeModal = document.querySelector(".close-modal");
    const searchInput = document.getElementById("postSearch");
    
    // Initialize
    fetchPosts();
    
    // Event Listeners
    searchInput.addEventListener("input", function(e) {
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

// Global variables
let allPosts = [];
const postsPerPage = 10;
let currentPage = 1;

// Fetch posts from API
async function fetchPosts() {
    try {
        const response = await fetch(
            "http://localhost/Counseling%20System/backend/posts/get_posts.php",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                }
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
        Swal.fire({
            icon: "error",
            title: "Failed to load posts",
            text: error.message || "Please try again later",
        });
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
            <td>${post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}</td>
            <td>${post.is_anonymous ? 'Anonymous' : post.author}</td>
            <td>${new Date(post.created_at).toLocaleDateString()}</td>
            <td class="actions">
                <button class="btn-view" onclick="viewPostDetails(${post.postId})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-delete" onclick="confirmDeletePost(${post.postId}, '${post.title}')">
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
            (post.author && !post.is_anonymous && post.author.toLowerCase().includes(searchTerm)) ||
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
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages || totalPages === 0;
}

// View post details in modal
async function viewPostDetails(postId) {
    try {
        const response = await fetch(
            `http://localhost/Counseling%20System/backend/posts/get_post.php?id=${postId}`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                }
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
        displayPostModal(post);
    } catch (error) {
        console.error("Error fetching post details:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to load details",
            text: error.message || "Please try again later",
        });
    }
}

// Display post details in modal
function displayPostModal(post) {
    const modal = document.getElementById("postModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = `Post Details: ${post.title}`;
    
    // Construct image HTML if exists
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
                        <span>${post.is_anonymous ? 'Anonymous' : post.author}</span>
                    </div>
                    <div class="post-meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(post.created_at).toLocaleDateString()}</span>
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

    modal.style.display = "block";
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
                body: JSON.stringify({ postId: postId })
            }
        );

        const result = await response.json();

        if (result.status === "success") {
            Swal.fire({
                icon: "success",
                title: "Post Deleted",
                text: result.message || `Post ID ${postId} has been deleted successfully`,
            });
            // Refresh the posts list
            fetchPosts();
        } else {
            throw new Error(result.message || "Failed to delete post");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error.message || "Could not delete post. Please try again.",
        });
    }
}