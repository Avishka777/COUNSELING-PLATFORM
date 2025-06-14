<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Counselor ID required']);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT * FROM counselors WHERE counselorid = ?");
    $stmt->execute([$_GET['id']]);
    $counselor = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$counselor) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Counselor not found']);
        exit();
    }
    
    // Add full image URL to the response
    $counselor['photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $counselor['photo'];
    
    echo json_encode([
        'status' => 'success',
        'data' => $counselor
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>