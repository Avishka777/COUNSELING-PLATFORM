<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['postId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Post ID is required"]);
        exit;
    }

    try {
        // Check if post exists
        $stmt = $conn->prepare("SELECT image FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Post not found"]);
            exit;
        }

        // Delete post
        $stmt = $conn->prepare("DELETE FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);

        // Delete associated image if exists
        if ($post['image']) {
            $imagePath = "../../uploads/posts/" . $post['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        echo json_encode(["status" => "success", "message" => "Post deleted successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>