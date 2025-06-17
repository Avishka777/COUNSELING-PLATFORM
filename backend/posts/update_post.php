<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $requiredFields = ['postId', 'title', 'description'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error", 
                "message" => "Missing required field: $field"
            ]);
            exit;
        }
    }

    try {
        // Check if post exists
        $stmt = $conn->prepare("SELECT postId FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode([
                "status" => "error", 
                "message" => "Post not found"
            ]);
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