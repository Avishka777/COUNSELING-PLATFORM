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
    // Get all appointments with user and counselor info
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
              ORDER BY a.date DESC, a.start_time DESC";
    
    $stmt = $conn->query($query);
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