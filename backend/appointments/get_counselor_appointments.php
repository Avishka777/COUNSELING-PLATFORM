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
    // Validate counselorId parameter
    if (!isset($_GET['counselorId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "counselorId parameter is required"]);
        exit;
    }

    $counselorId = filter_var($_GET['counselorId'], FILTER_VALIDATE_INT);
    if ($counselorId === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid counselorId"]);
        exit;
    }

    // Get appointments for specific counselor
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
              WHERE a.counselorId = :counselorId
              ORDER BY a.date DESC, a.start_time DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':counselorId', $counselorId, PDO::PARAM_INT);
    $stmt->execute();
    
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