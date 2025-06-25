<?php

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Include database connection
require_once("../config/db.php");

// Get the raw POST data and decode JSON into a PHP object
$data = json_decode(file_get_contents("php://input"));

// Prepare SQL query to find counselor by username
$stmt = $conn->prepare("SELECT * FROM counselors WHERE username = ?");
$stmt->execute([$data->username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verify if user exists and if the provided password matches the hashed password stored
if ($user && password_verify($data->password, $user['password'])) {
    echo json_encode(["message" => "Login successful", "user" => $user]);
} else {
    echo json_encode(["message" => "Invalid username or password"]);
}
?>