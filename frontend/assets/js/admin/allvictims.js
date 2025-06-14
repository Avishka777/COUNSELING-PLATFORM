document.addEventListener("DOMContentLoaded", function () {
  // Fetch users from API
  fetchUsers();

  // Search functionality
  document.getElementById("userSearch").addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    filterUsers(searchTerm);
  });
});

let allUsers = [];
const usersPerPage = 10;
let currentPage = 1;

async function fetchUsers() {
  try {
    const response = await fetch(
      "http://localhost/Counseling%20System/backend/victims/view_all_users.php",
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

    allUsers = data.data || data;
    renderUsers();
    updatePagination();
  } catch (error) {
    console.error("Error fetching users:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to load users",
      text: error.message || "Please try again later",
    });
  }
}

function renderUsers(users = allUsers) {
  const tableBody = document.querySelector("#usersTable tbody");
  tableBody.innerHTML = "";

  const startIdx = (currentPage - 1) * usersPerPage;
  const endIdx = startIdx + usersPerPage;
  const paginatedUsers = users.slice(startIdx, endIdx);

  if (paginatedUsers.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-results">No users found</td>
                    </tr>
                `;
    return;
  }

  paginatedUsers.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${user.userId}</td>
                    <td>${user.username}</td>
                    <td>${user.age || "N/A"}</td>
                    <td>${user.occupation || "N/A"}</td>
                    <td class="actions">
                        <button class="btn-delete" onclick="confirmDelete(${
                          user.userId
                        }, '${user.username}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });

  // Update showing count
  document.getElementById("showingCount").textContent = paginatedUsers.length;
  document.getElementById("totalCount").textContent = users.length;
}

function filterUsers(searchTerm) {
  if (!searchTerm) {
    renderUsers();
    return;
  }

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      (user.occupation && user.occupation.toLowerCase().includes(searchTerm)) ||
      user.userId.toString().includes(searchTerm)
  );

  renderUsers(filteredUsers);
}

function updatePagination() {
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === totalPages || totalPages === 0;
}

document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    renderUsers();
    updatePagination();
  }
});

document.getElementById("nextPage").addEventListener("click", function () {
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderUsers();
    updatePagination();
  }
});

function viewUser(userId) {
  // Implement view functionality
  Swal.fire({
    title: "User Details",
    text: `View details for user ID: ${userId}`,
    icon: "info",
    confirmButtonText: "OK",
  });
}

function confirmDelete(userId, username) {
  Swal.fire({
    title: "Confirm Delete",
    html: `Are you sure you want to delete <strong>${username}</strong> (ID: ${userId})?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteUser(userId);
    }
  });
}

async function deleteUser(userId) {
  try {
    const response = await fetch(
      `http://localhost/Counseling%20System/backend/victims/delete_user.php?id=${userId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    if (result.status === "success") {
      Swal.fire({
        icon: "success",
        title: "User Deleted",
        text:
          result.message || `User ID ${userId} has been deleted successfully`,
      });
      // Refresh the user list
      fetchUsers();
    } else {
      throw new Error(result.message || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: error.message || "Could not delete user. Please try again.",
    });
  }
}
