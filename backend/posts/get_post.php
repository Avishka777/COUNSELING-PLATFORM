<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Post ID is required"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT p.*, 
                           CASE WHEN p.is_anonymous THEN 'Anonymous' ELSE u.username END as author
                           FROM posts p
                           JOIN victims u ON p.userId = u.userId
                           WHERE p.postId = ?");
    $stmt->execute([$_GET['id']]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Post not found"]);
        exit;
    }
    
    // Add full image URL if exists
    if ($post['image']) {
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