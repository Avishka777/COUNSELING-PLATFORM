<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
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

    $query = "SELECT p.*, 
                     u.username as victim_username,
                     c.username as counselor_username,
                     c.name as counselor_name
              FROM counseling_progress p
              JOIN victims u ON p.victimId = u.userId
              JOIN counselors c ON p.counselorId = c.counselorId
              WHERE p.progressId = :progressId";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':progressId', $progressId, PDO::PARAM_INT);
    $stmt->execute();
    
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$progress) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Progress record not found"]);
        exit;
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