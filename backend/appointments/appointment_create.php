<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $requiredFields = ['date', 'start_time', 'end_time', 'counselorId', 'userId'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required field: $field"]);
            exit;
        }
    }

    try {
        // Check for time conflicts
        $conflictCheck = $conn->prepare("
            SELECT appointmentId FROM appointments 
            WHERE counselorId = :counselorId 
            AND date = :date 
            AND (
                (:start_time BETWEEN start_time AND end_time) 
                OR (:end_time BETWEEN start_time AND end_time)
                OR (start_time BETWEEN :start_time AND :end_time)
            )
        ");
        $conflictCheck->execute([
            ':counselorId' => $data['counselorId'],
            ':date' => $data['date'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time']
        ]);

        if ($conflictCheck->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Time slot already booked"]);
            exit;
        }

        // Check if end time is after start time
        if (strtotime($data['end_time']) <= strtotime($data['start_time'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "End time must be after start time"]);
            exit;
        }

        // Create appointment
        $stmt = $conn->prepare("
            INSERT INTO appointments 
            (date, start_time, end_time, counselorId, userId, notes, status) 
            VALUES (:date, :start_time, :end_time, :counselorId, :userId, :notes, :status)
        ");
        
        $stmt->execute([
            ':date' => $data['date'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'],
            ':counselorId' => $data['counselorId'],
            ':userId' => $data['userId'],
            ':notes' => $data['notes'] ?? null,
            ':status' => $data['status'] ?? 'pending'
        ]);

        $appointmentId = $conn->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Appointment created successfully",
            "appointmentId" => $appointmentId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>