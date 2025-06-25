<?php

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Include database connection
require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"));

// Prepare a SQL statement to select user details by username
$stmt = $conn->prepare("SELECT * FROM victims WHERE username = ?");
$stmt->execute([$data->username]);

// Fetch the user's record as an associative array
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// If user exists and the password is correct, return success response with user data
if ($user && password_verify($data->password, $user['password'])) {
    echo json_encode(["message" => "Login successful", "user" => $user]);
} else {
    echo json_encode(["message" => "Invalid username or password"]);
}
?>