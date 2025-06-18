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
    // Get optional filters
    $victimId = isset($_GET['victimId']) ? (int)$_GET['victimId'] : null;
    $counselorId = isset($_GET['counselorId']) ? (int)$_GET['counselorId'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;

    $query = "SELECT p.*, 
                     u.username as victim_username,
                     c.username as counselor_username,
                     c.name as counselor_name
              FROM counseling_progress p
              JOIN victims u ON p.victimId = u.userId
              JOIN counselors c ON p.counselorId = c.counselorId
              WHERE 1=1";
    
    $params = [];

    if ($victimId !== null) {
        $query .= " AND p.victimId = :victimId";
        $params[':victimId'] = $victimId;
    }

    if ($counselorId !== null) {
        $query .= " AND p.counselorId = :counselorId";
        $params[':counselorId'] = $counselorId;
    }

    if ($date !== null) {
        $query .= " AND p.counseling_date = :date";
        $params[':date'] = $date;
    }

    $query .= " ORDER BY p.counseling_date DESC, p.created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    
    $progressEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $progressEntries
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>