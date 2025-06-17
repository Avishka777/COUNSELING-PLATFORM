<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Set content type
header('Content-Type: application/json');

// Database connection
require_once("../config/db.php");

try {
    // Verify connection
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Query the database
    $stmt = $conn->query("SELECT userId, username, age, occupation FROM victims");
    
    if (!$stmt) {
        throw new Exception("Database query failed");
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'data' => $users
    ]);
    
} catch(PDOException $e) {
    // Database errors
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    
} catch(Exception $e) {
    // Other errors
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>