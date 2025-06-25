<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Decode the incoming JSON request body into an associative array
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate input
    if (empty($data['victimId']) || empty($data['counselorId']) || empty($data['description']) || empty($data['counseling_date'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    // Prepare SQL query to insert progress record
    $query = "INSERT INTO counseling_progress (victimId, counselorId, description, counseling_date) 
              VALUES (:victimId, :counselorId, :description, :counseling_date)";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':victimId', $data['victimId'], PDO::PARAM_INT);
    $stmt->bindParam(':counselorId', $data['counselorId'], PDO::PARAM_INT);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':counseling_date', $data['counseling_date']);

    // Execute the query and respond with success or failure
    if ($stmt->execute()) {
        $progressId = $conn->lastInsertId();
        echo json_encode([
            "status" => "success",
            "message" => "Progress record created",
            "progressId" => $progressId
        ]);
    } else {
        throw new Exception("Failed to create progress record");
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>