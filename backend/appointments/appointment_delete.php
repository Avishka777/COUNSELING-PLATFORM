<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['appointmentId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Appointment ID is required"]);
        exit;
    }

    try {
        // Check if appointment exists
        $checkStmt = $conn->prepare("SELECT * FROM appointments WHERE appointmentId = ?");
        $checkStmt->execute([$data['appointmentId']]);
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Appointment not found"]);
            exit;
        }

        // Delete appointment
        $stmt = $conn->prepare("DELETE FROM appointments WHERE appointmentId = ?");
        $stmt->execute([$data['appointmentId']]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Appointment deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Appointment not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>