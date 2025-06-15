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
    // Get all posts with user info (but hide if anonymous)
    $query = "SELECT p.postId, 
                     p.is_anonymous,
                     CASE WHEN p.is_anonymous THEN 'Anonymous' ELSE u.username END as author,
                     p.image, 
                     p.title, 
                     p.description, 
                     p.created_at
              FROM posts p
              JOIN victims u ON p.userId = u.userId
              ORDER BY p.created_at DESC";
    
    $stmt = $conn->query($query);
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