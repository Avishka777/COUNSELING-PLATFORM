document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const photoPreview = document.getElementById('photoPreview');
    
    // Load counselor data
    loadCounselorData();
    
    // Form submission handler
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Delete button handler
    deleteBtn.addEventListener('click', function() {
        confirmDelete();
    });
    
    // Photo preview handler
    document.getElementById('photo').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    async function loadCounselorData() {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.counselorId) {
                throw new Error('Counselor not logged in');
            }
            
            const response = await fetch(`http://localhost/Counseling%20System/backend/counselor/view_counselor.php?counselorId=${userData.counselorId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch counselor data');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Populate form fields
            document.getElementById('counselorId').value = data.counselorId;
            document.getElementById('username').value = data.username;
            document.getElementById('name').value = data.name;
            document.getElementById('current_profession').value = data.current_profession;
            document.getElementById('company').value = data.company;
            document.getElementById('specialization').value = data.specialization;
            document.getElementById('description').value = data.description;
            
            // Display photo if exists
            if (data.photo) {
                photoPreview.innerHTML = `<img src="${data.photo}" alt="Profile Photo" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            }
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load profile data',
            }).then(() => {
                window.location.href = '../auth/login.html';
            });
        }
    }
    
    async function updateProfile() {
        try {
            const formData = {
                counselorId: document.getElementById('counselorId').value,
                username: document.getElementById('username').value,
                name: document.getElementById('name').value,
                current_profession: document.getElementById('current_profession').value,
                company: document.getElementById('company').value,
                specialization: document.getElementById('specialization').value,
                description: document.getElementById('description').value,
                currentPassword: document.getElementById('currentPassword').value,
                newPassword: document.getElementById('newPassword').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            
            // Validate passwords if changing
            if (formData.newPassword) {
                if (!formData.currentPassword) {
                    throw new Error('Current password is required to change password');
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('New passwords do not match');
                }
            }
            
            // Handle file upload if photo changed
            const photoInput = document.getElementById('photo');
            if (photoInput.files.length > 0) {
                const fileData = new FormData();
                fileData.append('photo', photoInput.files[0]);
                fileData.append('counselorId', formData.counselorId);
                
                // First upload the photo
                const uploadResponse = await fetch('http://localhost/Counseling%20System/backend/counselor/upload_photo.php', {
                    method: 'POST',
                    body: fileData
                });
                
                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok || uploadResult.error) {
                    throw new Error(uploadResult.error || 'Failed to upload photo');
                }
            }
            
            // Then update profile data
            const response = await fetch('http://localhost/Counseling%20System/backend/counselor/update_counselor.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (!response.ok || result.error) {
                throw new Error(result.error || 'Failed to update profile');
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Profile updated successfully!',
                timer: 2000
            });
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.message || 'Could not update profile. Please try again.',
            });
        }
    }
    
    function confirmDelete() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this! All your data will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProfile();
            }
        });
    }
    
    async function deleteProfile() {
        try {
            const counselorId = document.getElementById('counselorId').value;
            
            const response = await fetch(`http://localhost/Counseling%20System/backend/counselor/delete_counselor.php?id=${counselorId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (!response.ok || result.error) {
                throw new Error(result.error || 'Failed to delete profile');
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Your account has been deleted.',
                timer: 2000
            }).then(() => {
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                window.location.href = '../../index.html';
            });
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.message || 'Could not delete account. Please try again.',
            });
        }
    }
});