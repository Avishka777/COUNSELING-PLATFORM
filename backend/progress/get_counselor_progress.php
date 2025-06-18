<?php
require_once("../config/db.php");
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Validate progressId parameter
    if (!isset($_GET['progressId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "progressId parameter is required"]);
        exit;
    }

    $progressId = filter_var($_GET['progressId'], FILTER_VALIDATE_INT);
    if ($progressId === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid progressId"]);
        exit;
    }

    // Get counselorId from localStorage data sent in headers
    $headers = getallheaders();
    $authData = isset($headers['Authorization']) ? json_decode(base64_decode($headers['Authorization']), true) : null;
    
    if (!$authData || !isset($authData['counselorId'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Authorization data missing"]);
        exit;
    }

    $counselorId = $authData['counselorId'];

    // Get specific progress record
    $query = "SELECT p.*, 
                     u.username as victim_username,
                     u.age as victim_age,
                     u.occupation as victim_occupation,
                     c.username as counselor_username,
                     c.name as counselor_name,
                     c.photo as counselor_photo,
                     c.current_profession as counselor_profession,
                     c.company as counselor_company
              FROM counseling_progress p
              JOIN victims u ON p.victimId = u.userId
              JOIN counselors c ON p.counselorId = c.counselorId
              WHERE p.progressId = :progressId
              AND p.counselorId = :counselorId";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':progressId', $progressId, PDO::PARAM_INT);
    $stmt->bindParam(':counselorId', $counselorId, PDO::PARAM_INT);
    $stmt->execute();
    
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$progress) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Progress record not found"]);
        exit;
    }

    // Convert photo path to full URL
    if ($progress['counselor_photo']) {
        $progress['counselor_photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $progress['counselor_photo'];
    }

    echo json_encode([
        "status" => "success",
        "data" => $progress
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>