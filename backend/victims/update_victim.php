<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get input data
$data = json_decode(file_get_contents("php://input"));

try {
    if (!isset($data->userId)) {
        http_response_code(400);
        echo json_encode(["error" => "User ID required"]);
        exit();
    }

    // First verify current password if trying to change password
    if (!empty($data->newPassword)) {
        if (empty($data->currentPassword)) {
            http_response_code(400);
            echo json_encode(["error" => "Current password is required to change password"]);
            exit();
        }

        // Get current password hash from database
        $stmt = $conn->prepare("SELECT password FROM victims WHERE userId = ?");
        $stmt->execute([$data->userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
            exit();
        }

        // Verify current password
        if (!password_verify($data->currentPassword, $user['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Current password is incorrect"]);
            exit();
        }

        // Validate new password
        if ($data->newPassword !== $data->confirmPassword) {
            http_response_code(400);
            echo json_encode(["error" => "New passwords do not match"]);
            exit();
        }

        // Hash the new password
        $hashedPassword = password_hash($data->newPassword, PASSWORD_DEFAULT);
    }

    // Prepare the update statement
    if (!empty($data->newPassword)) {
        // Update with password
        $stmt = $conn->prepare("UPDATE victims SET username = ?, age = ?, occupation = ?, password = ? WHERE userId = ?");
        $stmt->execute([
            $data->username,
            $data->age,
            $data->occupation,
            $hashedPassword,
            $data->userId
        ]);
    } else {
        // Update without password
        $stmt = $conn->prepare("UPDATE victims SET username = ?, age = ?, occupation = ? WHERE userId = ?");
        $stmt->execute([
            $data->username,
            $data->age,
            $data->occupation,
            $data->userId
        ]);
    }

    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "User updated successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "User not found or no changes made"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>