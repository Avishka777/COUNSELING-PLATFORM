<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_GET['counselorId'])) {
    try {
        $stmt = $conn->prepare("SELECT * FROM counselors WHERE counselorId = ?");
        $stmt->execute([$_GET['counselorId']]);
        $counselor = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($counselor) {
            // Convert photo path to full URL if needed
            if (!empty($counselor['photo'])) {
                $counselor['photo'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $counselor['photo'];
            }

            // Fetch availability
            $availabilityStmt = $conn->prepare("SELECT day_of_week, start_time, end_time FROM counselor_availability WHERE counselorId = ?");
            $availabilityStmt->execute([$_GET['counselorId']]);
            $availability = $availabilityStmt->fetchAll(PDO::FETCH_ASSOC);

            $counselor['availability'] = $availability;

            echo json_encode($counselor);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Counselor not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Counselor ID required"]);
}
?>