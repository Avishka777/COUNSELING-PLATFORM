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

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Post ID is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT p.*, 
                           CASE 
                               WHEN p.is_anonymous THEN 'Anonymous'
                               WHEN p.userId IS NOT NULL THEN u.username
                               WHEN p.counselorId IS NOT NULL THEN c.username
                               ELSE 'Unknown'
                           END as author,
                           CASE
                               WHEN p.userId IS NOT NULL THEN 'user'
                               WHEN p.counselorId IS NOT NULL THEN 'counselor'
                               ELSE 'unknown'
                           END as author_type
                           FROM posts p
                           LEFT JOIN victims u ON p.userId = u.userId
                           LEFT JOIN counselors c ON p.counselorId = c.counselorId
                           WHERE p.postId = ?");
    $stmt->execute([$_GET['id']]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        exit;
    }
    
    // Add full image URL if exists
    if (!empty($post['image'])) {
        $post['image_url'] = 'http://' . $_SERVER['HTTP_HOST'] . '/Counseling%20System/uploads/posts/' . $post['image'];
    }
    
    echo json_encode([
        "status" => "success",
        "data" => $post
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>