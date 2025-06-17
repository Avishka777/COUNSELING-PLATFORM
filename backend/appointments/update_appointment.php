<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (empty($data['appointmentId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Appointment ID is required"]);
        exit;
    }

    try {
        // Check if appointment exists
        $checkStmt = $conn->prepare("SELECT * FROM appointments WHERE appointmentId = ?");
        $checkStmt->execute([$data['appointmentId']]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Appointment not found"]);
            exit;
        }

        // Check for time conflicts if time is being updated
        if (isset($data['date']) || isset($data['start_time']) || isset($data['end_time'])) {
            $date = $data['date'] ?? $existing['date'];
            $start_time = $data['start_time'] ?? $existing['start_time'];
            $end_time = $data['end_time'] ?? $existing['end_time'];
            $counselorId = $data['counselorId'] ?? $existing['counselorId'];

            $conflictCheck = $conn->prepare("
                SELECT appointmentId FROM appointments 
                WHERE counselorId = :counselorId 
                AND date = :date 
                AND appointmentId != :appointmentId
                AND (
                    (:start_time BETWEEN start_time AND end_time) 
                    OR (:end_time BETWEEN start_time AND end_time)
                    OR (start_time BETWEEN :start_time AND :end_time)
                )
            ");
            $conflictCheck->execute([
                ':counselorId' => $counselorId,
                ':date' => $date,
                ':appointmentId' => $data['appointmentId'],
                ':start_time' => $start_time,
                ':end_time' => $end_time
            ]);

            if ($conflictCheck->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Time slot already booked"]);
                exit;
            }
        }

        // Build update query
        $updates = [];
        $params = [];
        
        $fields = ['date', 'start_time', 'end_time', 'counselorId', 'userId', 'status', 'notes'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "No fields to update"]);
            exit;
        }

        $params[] = $data['appointmentId'];
        
        $query = "UPDATE appointments SET " . implode(", ", $updates) . " WHERE appointmentId = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute($params);

        echo json_encode(["status" => "success", "message" => "Appointment updated successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>