# Online Counseling Platform

An anonymous online counseling platform connecting victims (anonymous users) with counselors, managed by administrators. Built with PHP, MySQL, and standard web technologies.

## Features

### For Victims (Anonymous Users)
- ✅ Anonymous registration and login (no personal details required)
- ✅ Profile management (view/edit/delete)
- ✅ Book counseling appointments based on counselor availability
- ✅ View appointment details and Zoom meeting links
- ✅ Upload motivational/personal posts anonymously
- ✅ Manage posts (view/edit/delete)
- ✅ Track counseling progress updates from counselors

### For Counselors
- 🔒 Secure registration and login
- 👤 Profile management (view/edit/delete)
- ✍️ Create and manage motivational/counseling posts
- 🗓 Set available appointment dates/times
- 📅 Manage appointment schedules
- 📈 Update victims' counseling progress/status after sessions

### For Administrators
- 🔐 Secure admin login
- 👥 View all registered victims and counselors
- 📝 View all posts (from both victims and counselors)
- 🚫 Delete inappropriate content
- 📋 View all appointment schedules
- 🔗 Generate and post Zoom meeting links for appointments
- 📢 Post news and updates
- ✏️ Manage admin posts (view/edit/delete)

### For All Visitors (Without Login)
- 🏠 View homepage (About Us, Contact, Counselor details)
- 📰 Browse public feed with posts from all users

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- PHP

### Database
- MySQL (via phpMyAdmin)

### Server
- XAMPP

## Installation

1. **Prerequisites**:
   - Install XAMPP (includes Apache, MySQL, PHP)
   - Ensure PHP 7.0+ is installed

2. **Setup**:
   - Clone this repository into your `htdocs` folder
   - Import the database from `database/db_export.sql` to phpMyAdmin
   - Configure database connection in `config.php`

3. **Run**:
   - Start Apache and MySQL from XAMPP control panel
   - Access the application at `http://localhost/your-project-folder`


## Usage

1. **For Victims**:
   - Register anonymously
   - Book appointments when counselors are available
   - Check your dashboard for Zoom links and progress updates

2. **For Counselors**:
   - Register with professional credentials
   - Set your availability schedule
   - Manage appointments and update client progress

3. **For Admins**:
   - Monitor all system activity
   - Approve appointments and generate meeting links
   - Moderate content as needed

## Contributing

1. Fork the repository.
2. Create your feature branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/your-feature).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any inquiries, contact **a.rathnakumara777@gmail.com** or open an issue on GitHub.