<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Check if 'userId' parameter is provided in the GET request
if (isset($_GET['userId'])) {
    try {
        // Prepare SQL query to fetch user details by userId
        $stmt = $conn->prepare("SELECT * FROM victims WHERE userId = ?");
        $stmt->execute([$_GET['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            echo json_encode(["message" => "User not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "User ID required"]);
}
?>