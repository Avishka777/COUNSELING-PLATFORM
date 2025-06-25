<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Read input data
$data = json_decode(file_get_contents("php://input"));

// Input validation
$errors = [];

if (empty($data->username)) {
    $errors[] = "Username is required.";
}
if (empty($data->password)) {
    $errors[] = "Password is required.";
}
if (!isset($data->age) || !is_numeric($data->age) || $data->age <= 0) {
    $errors[] = "Valid age is required.";
}
if (empty($data->occupation)) {
    $errors[] = "Occupation is required.";
}

if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit;
}

// Check for existing username
$stmt = $conn->prepare("SELECT * FROM victims WHERE username = ?");
$stmt->execute([$data->username]);
if ($stmt->rowCount() > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Username already exists."
    ]);
    exit;
}

// Insert new user
$hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO victims (username, password, age, occupation) VALUES (?, ?, ?, ?)");
try {
    $stmt->execute([
        $data->username,
        $hashedPassword,
        $data->age,
        $data->occupation,
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Victims registered successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>