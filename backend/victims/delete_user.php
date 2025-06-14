<?php
require_once("../config/db.php");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle DELETE requests
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Get the user ID from query parameters
        $userId = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID required"]);
            exit();
        }

        // Delete the user
        $stmt = $conn->prepare("DELETE FROM victims WHERE userId = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>