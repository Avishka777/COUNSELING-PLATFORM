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
    // Check if appointment ID is provided
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Appointment ID is required"]);
        exit;
    }

    $appointmentId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($appointmentId === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid appointment ID"]);
        exit;
    }

    // Get single appointment with user and counselor info
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
                     c.company as counselor_company,
                     c.specialization
              FROM appointments a
              JOIN victims u ON a.userId = u.userId
              JOIN counselors c ON a.counselorId = c.counselorId
              WHERE a.appointmentId = :appointmentId";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':appointmentId', $appointmentId, PDO::PARAM_INT);
    $stmt->execute();

    $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$appointment) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Appointment not found"]);
        exit;
    }

    // Convert photo path to full URL
    if ($appointment['counselor_photo']) {
        $appointment['counselor_photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $appointment['counselor_photo'];
    }

    echo json_encode([
        "status" => "success",
        "data" => $appointment
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>