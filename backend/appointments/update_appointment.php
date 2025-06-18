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

try {
    // Only allow PUT method
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
        exit;
    }

    // Get and validate input data
    $input = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
        exit;
    }

    // Validate required fields
    if (empty($input['appointmentId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Appointment ID is required"]);
        exit;
    }

    // Check if appointment exists
    $stmt = $conn->prepare("SELECT * FROM appointments WHERE appointmentId = ?");
    $stmt->execute([$input['appointmentId']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Appointment not found"]);
        exit;
    }

    // Validate time if being updated
    if (isset($input['start_time']) || isset($input['end_time'])) {
        $start_time = $input['start_time'] ?? $existing['start_time'];
        $end_time = $input['end_time'] ?? $existing['end_time'];
        
        if ($start_time >= $end_time) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "End time must be after start time"]);
            exit;
        }
    }

    // Check for time conflicts if time is being updated
    if (isset($input['date']) || isset($input['start_time']) || isset($input['end_time'])) {
        $date = $input['date'] ?? $existing['date'];
        $start_time = $input['start_time'] ?? $existing['start_time'];
        $end_time = $input['end_time'] ?? $existing['end_time'];
        $counselorId = $input['counselorId'] ?? $existing['counselorId'];

        $conflictCheck = $conn->prepare("
            SELECT appointmentId FROM appointments 
            WHERE counselorId = :counselorId 
            AND date = :date 
            AND appointmentId != :appointmentId
            AND (
                (:start_time < end_time AND :end_time > start_time)
            )
            AND status != 'cancelled'
        ");
        $conflictCheck->execute([
            ':counselorId' => $counselorId,
            ':date' => $date,
            ':appointmentId' => $input['appointmentId'],
            ':start_time' => $start_time,
            ':end_time' => $end_time
        ]);

        if ($conflictCheck->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Time slot conflicts with existing appointment"]);
            exit;
        }
    }

    // Validate status if being updated
    if (isset($input['status'])) {
        $validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!in_array($input['status'], $validStatuses)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid status value"]);
            exit;
        }
    }

    // Build update query
    $updates = [];
    $params = [];
    
    $updatableFields = [
        'date' => PDO::PARAM_STR,
        'start_time' => PDO::PARAM_STR,
        'end_time' => PDO::PARAM_STR,
        'counselorId' => PDO::PARAM_INT,
        'userId' => PDO::PARAM_INT,
        'status' => PDO::PARAM_STR,
        'notes' => PDO::PARAM_STR
    ];

    foreach ($updatableFields as $field => $paramType) {
        if (isset($input[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No valid fields to update"]);
        exit;
    }

    // Add appointmentId to params
    $params[':appointmentId'] = $input['appointmentId'];
    
    // Execute update
    $query = "UPDATE appointments SET " . implode(", ", $updates) . 
             ", updated_at = CURRENT_TIMESTAMP WHERE appointmentId = :appointmentId";
    $stmt = $conn->prepare($query);
    
    // Bind parameters with correct types
    foreach ($params as $key => $value) {
        $paramType = $updatableFields[str_replace(':', '', $key)] ?? PDO::PARAM_STR;
        $stmt->bindValue($key, $value, $paramType);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to update appointment");
    }

    // Return updated appointment data
    $stmt = $conn->prepare("SELECT * FROM appointments WHERE appointmentId = ?");
    $stmt->execute([$input['appointmentId']]);
    $updatedAppointment = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "message" => "Appointment updated successfully",
        "data" => $updatedAppointment
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>