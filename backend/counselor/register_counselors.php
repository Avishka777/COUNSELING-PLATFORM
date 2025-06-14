<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validation
    $required_fields = ['username', 'password', 'name', 'current_profession', 'company', 'specialization', 'description'];
    $errors = [];

    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            $errors[] = ucfirst(str_replace('_', ' ', $field)) . " is required.";
        }
    }

    // File validation
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        $errors[] = "Photo is required and must be valid.";
    }

    if (!empty($errors)) {
        echo json_encode(["status" => "error", "errors" => $errors]);
        exit;
    }

    // Check if username exists
    $stmt = $conn->prepare("SELECT * FROM counselors WHERE username = ?");
    $stmt->execute([$_POST['username']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "error", "message" => "Username already exists."]);
        exit;
    }

    // Save photo
    $upload_dir = "../../uploads/counselors/";
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $photo_tmp = $_FILES['photo']['tmp_name'];
    $photo_name = uniqid() . "_" . basename($_FILES['photo']['name']);
    $target_path = $upload_dir . $photo_name;

    if (!move_uploaded_file($photo_tmp, $target_path)) {
        echo json_encode(["status" => "error", "message" => "Failed to upload photo."]);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Insert data
    $stmt = $conn->prepare("INSERT INTO counselors (username, password, name, photo, current_profession, company, specialization, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    try {
        $stmt->execute([
            $_POST['username'],
            $hashedPassword,
            $_POST['name'],
            $photo_name, // Store only filename
            $_POST['current_profession'],
            $_POST['company'],
            $_POST['specialization'],
            $_POST['description']
        ]);

        echo json_encode(["status" => "success", "message" => "Counselor registered successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
