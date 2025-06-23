<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get input data
$data = json_decode(file_get_contents("php://input"));

try {
    if (!isset($data->counselorId)) {
        http_response_code(400);
        echo json_encode(["error" => "Counselor ID required"]);
        exit();
    }

    // Prepare base update query and params
    $query = "UPDATE counselors SET name = ?, current_profession = ?, company = ?, specialization = ?, description = ?";
    $params = [
        $data->name,
        $data->current_profession,
        $data->company,
        $data->specialization,
        $data->description,
    ];

    // Handle password update if provided
    if (!empty($data->newPassword)) {
        if (empty($data->currentPassword)) {
            http_response_code(400);
            echo json_encode(["error" => "Current password is required to change password"]);
            exit();
        }

        // Verify current password
        $stmt = $conn->prepare("SELECT password FROM counselors WHERE counselorId = ?");
        $stmt->execute([$data->counselorId]);
        $counselor = $stmt->fetch();

        if (!$counselor || !password_verify($data->currentPassword, $counselor['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Current password is incorrect"]);
            exit();
        }

        $query .= ", password = ?";
        $params[] = password_hash($data->newPassword, PASSWORD_DEFAULT);
    }

    $query .= " WHERE counselorId = ?";
    $params[] = $data->counselorId;

    // Execute update
    $stmt = $conn->prepare($query);
    $stmt->execute($params);

    // Update availability if provided
    if (isset($data->availability) && is_array($data->availability)) {
        // Delete existing availability for counselor
        $delStmt = $conn->prepare("DELETE FROM counselor_availability WHERE counselorId = ?");
        $delStmt->execute([$data->counselorId]);

        // Insert new availability slots
        $insertStmt = $conn->prepare("
            INSERT INTO counselor_availability (counselorId, day_of_week, start_time, end_time)
            VALUES (?, ?, ?, ?)
        ");

        foreach ($data->availability as $slot) {
            // Validate keys and sanitize inputs if needed
            if (
                isset($slot->day_of_week, $slot->start_time, $slot->end_time)
                && !empty($slot->day_of_week)
                && !empty($slot->start_time)
                && !empty($slot->end_time)
            ) {
                $insertStmt->execute([
                    $data->counselorId,
                    $slot->day_of_week,
                    $slot->start_time,
                    $slot->end_time
                ]);
            }
        }
    }

    echo json_encode(["message" => "Profile updated successfully"]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
