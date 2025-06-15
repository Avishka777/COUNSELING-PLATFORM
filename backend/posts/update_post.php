<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['postId']) || empty($data['title']) || empty($data['description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Post ID, title and description are required"]);
        exit;
    }

    try {
        // Check if post exists and belongs to user
        $stmt = $conn->prepare("SELECT userId FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Post not found"]);
            exit;
        }

        // Update post
        $stmt = $conn->prepare("UPDATE posts SET 
            title = ?, 
            description = ?,
            is_anonymous = ?
            WHERE postId = ?");
        
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['is_anonymous'] ?? false,
            $data['postId']
        ]);

        echo json_encode(["status" => "success", "message" => "Post updated successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>