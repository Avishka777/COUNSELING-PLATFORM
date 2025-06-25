<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Ensure counselorId is provided in the request
    if (!isset($_GET['counselorId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "counselorId parameter is required"]);
        exit;
    }

    // Sanitize and validate counselorId
    $counselorId = filter_var($_GET['counselorId'], FILTER_VALIDATE_INT);
    if ($counselorId === false) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid counselorId"]);
        exit;
    }

    // Optional filters
    $victimId = isset($_GET['victimId']) ? (int) $_GET['victimId'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;
    $username = isset($_GET['username']) ? trim($_GET['username']) : null;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;

    // Build base SQL query
    $query = "SELECT p.*, 
                     u.username as victim_username,
                     u.age as victim_age,
                     u.occupation as victim_occupation,
                     c.username as counselor_username,
                     c.name as counselor_name,
                     c.photo as counselor_photo,
                     c.current_profession as counselor_profession,
                     c.company as counselor_company
              FROM counseling_progress p
              JOIN victims u ON p.victimId = u.userId
              JOIN counselors c ON p.counselorId = c.counselorId
              WHERE p.counselorId = :counselorId";

    $params = [':counselorId' => $counselorId];

    if ($victimId !== null) {
        $query .= " AND p.victimId = :victimId";
        $params[':victimId'] = $victimId;
    }

    if (!empty($username)) {
        $query .= " AND u.username LIKE :username";
        $params[':username'] = '%' . $username . '%';
    }

    if (!empty($date)) {
        $query .= " AND p.counseling_date = :date";
        $params[':date'] = $date;
    }

    $query .= " ORDER BY p.counseling_date DESC, p.created_at DESC";

    if ($limit !== null && $limit > 0) {
        $query .= " LIMIT :limit";
        $params[':limit'] = $limit;
    }

    $stmt = $conn->prepare($query);

    foreach ($params as $key => $value) {
        $paramType = (strpos($key, 'Id') !== false || $key === ':limit')
            ? PDO::PARAM_INT
            : PDO::PARAM_STR;
        $stmt->bindValue($key, $value, $paramType);
    }

    // Execute the query and fetch all results
    $stmt->execute();
    $progressEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($progressEntries as &$entry) {
        if (!empty($entry['counselor_photo'])) {
            $entry['counselor_photo_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/counselors/' . $entry['counselor_photo'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $progressEntries
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>