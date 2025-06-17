<?php
require_once("../config/db.php");

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
    // Check if a specific user's posts are requested
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
    $counselorId = isset($_GET['counselorId']) ? $_GET['counselorId'] : null;

    // Base query
    $query = "SELECT p.postId, 
                     p.is_anonymous,
                     CASE 
                         WHEN p.is_anonymous THEN 'Anonymous'
                         WHEN p.userId IS NOT NULL THEN u.username
                         WHEN p.counselorId IS NOT NULL THEN c.username
                         ELSE 'Unknown'
                     END as author,
                     p.image, 
                     p.title, 
                     p.description, 
                     p.created_at,
                     CASE
                         WHEN p.userId IS NOT NULL THEN 'user'
                         WHEN p.counselorId IS NOT NULL THEN 'counselor'
                         ELSE 'unknown'
                     END as author_type
              FROM posts p
              LEFT JOIN victims u ON p.userId = u.userId
              LEFT JOIN counselors c ON p.counselorId = c.counselorId";

    // Add WHERE clause if filtering by user or counselor
    $params = [];
    if ($userId) {
        $query .= " WHERE p.userId = ?";
        $params[] = $userId;
    } elseif ($counselorId) {
        $query .= " WHERE p.counselorId = ?";
        $params[] = $counselorId;
    }

    $query .= " ORDER BY p.created_at DESC";
    
    // Prepare and execute the query
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert image paths to full URLs
    foreach ($posts as &$post) {
        if ($post['image']) {
            $post['image_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/posts/' . $post['image'];
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $posts
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>