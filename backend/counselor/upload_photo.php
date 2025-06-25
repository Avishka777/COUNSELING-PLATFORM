<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if (!isset($_POST['counselorId']) || !isset($_FILES['photo'])) {
        http_response_code(400);
        echo json_encode(["error" => "Counselor ID and photo are required"]);
        exit();
    }

    $counselorId = $_POST['counselorId'];
    $photo = $_FILES['photo'];

    // Validate file
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($photo['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["error" => "Only JPG, PNG, and GIF images are allowed"]);
        exit();
    }

    if ($photo['size'] > 2 * 1024 * 1024) { // 2MB max
        http_response_code(400);
        echo json_encode(["error" => "Image size must be less than 2MB"]);
        exit();
    }

    // Get old photo name to delete later
    $stmt = $conn->prepare("SELECT photo FROM counselors WHERE counselorId = ?");
    $stmt->execute([$counselorId]);
    $oldPhoto = $stmt->fetchColumn();

    // Generate unique filename
    $extension = pathinfo($photo['name'], PATHINFO_EXTENSION);
    $newFilename = 'counselor_' . $counselorId . '_' . time() . '.' . $extension;
    $uploadPath = $_SERVER['DOCUMENT_ROOT'] . '/Counseling%20System/uploads/' . $newFilename;

    // Move uploaded file
    if (!move_uploaded_file($photo['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to upload photo"]);
        exit();
    }

    // Update database
    $stmt = $conn->prepare("UPDATE counselors SET photo = ? WHERE counselorId = ?");
    $stmt->execute([$newFilename, $counselorId]);

    // Delete old photo if exists
    if ($oldPhoto) {
        $oldPath = $_SERVER['DOCUMENT_ROOT'] . '/Counseling%20System/uploads/' . $oldPhoto;
        if (file_exists($oldPath)) {
            unlink($oldPath);
        }
    }

    echo json_encode(["message" => "Photo updated successfully", "photo" => $newFilename]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>