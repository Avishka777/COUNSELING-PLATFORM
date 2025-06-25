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
    // Validate victimId parameter
    if (!isset($_GET['victimId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "victimId parameter is required"]);
        exit;
    }

    $victimId = filter_var($_GET['victimId'], FILTER_VALIDATE_INT);
    if ($victimId === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid victimId"]);
        exit;
    }

    // Get optional filters
    $counselorId = isset($_GET['counselorId']) ? (int) $_GET['counselorId'] : null;
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;

    // Base query with joins
    $query = "SELECT 
                cp.progressId,
                cp.description,
                cp.counseling_date,
                cp.created_at,
                v.userId as victimId,
                v.username as victim_username,
                v.age as victim_age,
                v.occupation as victim_occupation,
                c.counselorId,
                c.username as counselor_username,
                c.name as counselor_name,
                c.photo as counselor_photo,
                c.current_profession as counselor_profession,
                c.company as counselor_company,
                c.specialization as counselor_specialization
              FROM counseling_progress cp
              JOIN victims v ON cp.victimId = v.userId
              JOIN counselors c ON cp.counselorId = c.counselorId
              WHERE cp.victimId = :victimId";

    $params = [':victimId' => $victimId];

    // Add filters
    if ($counselorId !== null) {
        $query .= " AND cp.counselorId = :counselorId";
        $params[':counselorId'] = $counselorId;
    }

    if ($startDate !== null) {
        $query .= " AND cp.counseling_date >= :startDate";
        $params[':startDate'] = $startDate;
    }

    if ($endDate !== null) {
        $query .= " AND cp.counseling_date <= :endDate";
        $params[':endDate'] = $endDate;
    }

    // Order and limit
    $query .= " ORDER BY cp.counseling_date DESC, cp.created_at DESC";

    if ($limit !== null && $limit > 0) {
        $query .= " LIMIT :limit";
        $params[':limit'] = $limit;
    }

    // Prepare and execute query
    $stmt = $conn->prepare($query);

    // Bind parameters with correct types
    foreach ($params as $key => $value) {
        $paramType = (strpos($key, 'Id') !== false || $key === ':limit')
            ? PDO::PARAM_INT
            : PDO::PARAM_STR;
        $stmt->bindValue($key, $value, $paramType);
    }

    $stmt->execute();
    $progressReports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert photo paths to full URLs if needed
    foreach ($progressReports as &$report) {
        if (!empty($report['counselor_photo'])) {
            $report['counselor_photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $report['counselor_photo'];
        }
    }

    // Return successful response
    echo json_encode([
        "status" => "success",
        "data" => $progressReports
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>