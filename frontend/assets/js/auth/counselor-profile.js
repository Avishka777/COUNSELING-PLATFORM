document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profileForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const photoPreview = document.getElementById('photoPreview');

    // Availability elements
    const availabilityContainer = document.getElementById('availability-container');
    const addAvailabilityBtn = document.getElementById('addAvailabilityBtn');

    // Days of the week options
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Function to add availability slot UI
    function addAvailabilitySlot(day = "", start = "", end = "") {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('availability-slot');

        // Day select
        const daySelect = document.createElement('select');
        daySelect.name = 'availability_day[]';
        daysOfWeek.forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            if (d === day) option.selected = true;
            daySelect.appendChild(option);
        });

        // Start time input
        const startTime = document.createElement('input');
        startTime.type = 'time';
        startTime.name = 'availability_start[]';
        startTime.value = start;

        // End time input
        const endTime = document.createElement('input');
        endTime.type = 'time';
        endTime.name = 'availability_end[]';
        endTime.value = end;

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('remove-slot-btn');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            slotDiv.remove();
        });

        slotDiv.appendChild(daySelect);
        slotDiv.appendChild(startTime);
        slotDiv.appendChild(endTime);
        slotDiv.appendChild(removeBtn);

        availabilityContainer.appendChild(slotDiv);
    }

    addAvailabilityBtn.addEventListener('click', () => {
        addAvailabilitySlot();
    });

    // Load counselor data
    loadCounselorData();

    // Form submission handler
    profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        updateProfile();
    });

    // Delete button handler
    deleteBtn.addEventListener('click', function () {
        confirmDelete();
    });

    // Photo preview handler
    document.getElementById('photo').addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (event) {
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

        if (!data.success) {
            throw new Error(data.error || 'Failed to load counselor data');
        }

        const counselor = data.counselor;
        const availability = data.availability;

        // Populate form fields
        document.getElementById('counselorId').value = counselor.counselorId;
        document.getElementById('username').value = counselor.username;
        document.getElementById('name').value = counselor.name;
        document.getElementById('current_profession').value = counselor.current_profession;
        document.getElementById('company').value = counselor.company;
        document.getElementById('specialization').value = counselor.specialization;
        document.getElementById('description').value = counselor.description;

        // Display photo if exists
        if (counselor.photo) {
            photoPreview.innerHTML = `<img src="${counselor.photo}" alt="Profile Photo" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
        }

        // Load availability if exists
        availabilityContainer.innerHTML = ''; // clear existing slots
        
        if (availability && Object.keys(availability).length > 0) {
            // Convert grouped availability to array format
            for (const day in availability) {
                if (availability.hasOwnProperty(day)) {
                    availability[day].forEach(slot => {
                        addAvailabilitySlot(day, slot.start_time, slot.end_time);
                    });
                }
            }
        } else {
            // If no availability data, add one empty slot by default
            addAvailabilitySlot();
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

            // Collect availability data from the form
            const availabilitySlots = [];
            const daySelects = availabilityContainer.querySelectorAll('select[name="availability_day[]"]');
            const startTimes = availabilityContainer.querySelectorAll('input[name="availability_start[]"]');
            const endTimes = availabilityContainer.querySelectorAll('input[name="availability_end[]"]');

            for (let i = 0; i < daySelects.length; i++) {
                const day = daySelects[i].value;
                const start = startTimes[i].value;
                const end = endTimes[i].value;

                // Only include if all fields are filled
                if (day && start && end) {
                    availabilitySlots.push({ day_of_week: day, start_time: start, end_time: end });
                }
            }
            formData.availability = availabilitySlots;

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
