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

    // Prepare base update query
    $query = "UPDATE counselors SET name = ?, current_profession = ?, company = ?, specialization = ?, description = ?";
    $params = [
        $data->name,
        $data->current_profession,
        $data->company,
        $data->specialization,
        $data->description,
        $data->counselorId
    ];

    // Add password update if provided
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

        if (!password_verify($data->currentPassword, $counselor['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Current password is incorrect"]);
            exit();
        }

        $query .= ", password = ?";
        array_splice($params, -1, 0, [password_hash($data->newPassword, PASSWORD_DEFAULT)]);
    }

    $query .= " WHERE counselorId = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Profile updated successfully"]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "No changes made or counselor not found"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>