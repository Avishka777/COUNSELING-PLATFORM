<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Check if counselorId is provided and valid
if (!isset($_GET['counselorId']) || !is_numeric($_GET['counselorId'])) {
    http_response_code(400);
    echo json_encode(["error" => "Valid counselor ID is required"]);
    exit;
}

$counselorId = intval($_GET['counselorId']);

try {
    // Start transaction to ensure data consistency
    $conn->beginTransaction();

    // Get counselor details
    $stmt = $conn->prepare("
        SELECT 
            counselorId, 
            username, 
            name, 
            photo, 
            current_profession, 
            company, 
            specialization, 
            description, 
            created_at
        FROM counselors 
        WHERE counselorId = ?
    ");
    $stmt->execute([$counselorId]);
    $counselor = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$counselor) {
        http_response_code(404);
        echo json_encode(["error" => "Counselor not found"]);
        $conn->rollBack();
        exit;
    }

    // Convert photo path to full URL if needed
    if (!empty($counselor['photo'])) {
        $counselor['photo'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $counselor['photo'];
    } else {
        $counselor['photo'] = null; // Ensure consistent response
    }

    // Fetch availability
    $availabilityStmt = $conn->prepare("
        SELECT 
            availabilityId,
            day_of_week, 
            TIME_FORMAT(start_time, '%H:%i') as start_time, 
            TIME_FORMAT(end_time, '%H:%i') as end_time 
        FROM counselor_availability 
        WHERE counselorId = ?
        ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
                 start_time
    ");
    $availabilityStmt->execute([$counselorId]);
    $availability = $availabilityStmt->fetchAll(PDO::FETCH_ASSOC);

    // Group availability by day for better frontend consumption
    $groupedAvailability = [];
    foreach ($availability as $slot) {
        $day = $slot['day_of_week'];
        if (!isset($groupedAvailability[$day])) {
            $groupedAvailability[$day] = [];
        }
        $groupedAvailability[$day][] = [
            'availabilityId' => $slot['availabilityId'],
            'start_time' => $slot['start_time'],
            'end_time' => $slot['end_time']
        ];
    }

    $conn->commit();

    // Combine all data
    $response = [
        'success' => true,
        'counselor' => $counselor,
        'availability' => $groupedAvailability
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode([
        "error" => "Database error",
        "message" => $e->getMessage()
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode([
        "error" => "Server error",
        "message" => $e->getMessage()
    ]);
}
?>