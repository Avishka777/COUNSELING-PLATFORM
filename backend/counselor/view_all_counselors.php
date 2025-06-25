<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

try {
    $stmt = $conn->query("SELECT * FROM counselors");
    $counselors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process each counselor to include full photo URL
    foreach ($counselors as &$counselor) {
        if (!empty($counselor['photo'])) {
            $counselor['photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $counselor['photo'];
        } else {
            $counselor['photo_url'] = null;
        }
    }

    // Send JSON response with success status and data containing counselors list
    echo json_encode([
        'status' => 'success',
        'data' => $counselors
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>