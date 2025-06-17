<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
    $counselorId = isset($_GET['counselorId']) ? $_GET['counselorId'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    $query = "SELECT a.*, c.name as counselorName, v.username as victimName 
              FROM appointments a
              JOIN counselors c ON a.counselorId = c.counselorId
              JOIN victims v ON a.userId = v.userId";
    
    $conditions = [];
    $params = [];

    if ($userId) {
        $conditions[] = "a.userId = ?";
        $params[] = $userId;
    }

    if ($counselorId) {
        $conditions[] = "a.counselorId = ?";
        $params[] = $counselorId;
    }

    if ($date) {
        $conditions[] = "a.date = ?";
        $params[] = $date;
    }

    if ($status) {
        $conditions[] = "a.status = ?";
        $params[] = $status;
    }

    if (!empty($conditions)) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $query .= " ORDER BY a.date, a.start_time";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $appointments
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>