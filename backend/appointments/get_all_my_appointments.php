<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
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
    // Get user ID from query parameters
    $userId = isset($_GET['userId']) ? (int) $_GET['userId'] : null;
    $counselorId = isset($_GET['counselorId']) ? (int) $_GET['counselorId'] : null;

    // Validate at least one ID is provided
    if ($userId === null && $counselorId === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Either userId or counselorId is required"]);
        exit;
    }

    // Base query
    $query = "SELECT a.appointmentId, 
                     a.date, 
                     a.start_time, 
                     a.end_time,
                     a.status,
                     a.notes,
                     a.created_at,
                     u.userId,
                     u.username as user_username,
                     u.age as user_age,
                     u.occupation as user_occupation,
                     c.counselorId,
                     c.username as counselor_username,
                     c.name as counselor_name,
                     c.photo as counselor_photo,
                     c.current_profession as counselor_profession,
                     c.company as counselor_company
              FROM appointments a
              JOIN victims u ON a.userId = u.userId
              JOIN counselors c ON a.counselorId = c.counselorId
              WHERE ";

    // Add condition based on provided ID
    if ($userId !== null && $counselorId !== null) {
        $query .= "(a.userId = :userId OR a.counselorId = :counselorId)";
        $params = [':userId' => $userId, ':counselorId' => $counselorId];
    } elseif ($userId !== null) {
        $query .= "a.userId = :userId";
        $params = [':userId' => $userId];
    } else {
        $query .= "a.counselorId = :counselorId";
        $params = [':counselorId' => $counselorId];
    }

    $query .= " ORDER BY a.date DESC, a.start_time DESC";

    // Prepare and execute query
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert photo paths to full URLs
    foreach ($appointments as &$appointment) {
        if ($appointment['counselor_photo']) {
            $appointment['counselor_photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $appointment['counselor_photo'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $appointments
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>