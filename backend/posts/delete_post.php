<?php

// Include database connection
require_once("../config/db.php");

// Allow requests from any origin and specify response content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Respond to preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if postId is provided
    if (empty($data['postId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Post ID is required"]);
        exit;
    }

    try {
        // Retrieve the image file name for the post (if any)
        $stmt = $conn->prepare("SELECT image FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Post not found"]);
            exit;
        }

        // Delete the post record from the database
        $stmt = $conn->prepare("DELETE FROM posts WHERE postId = ?");
        $stmt->execute([$data['postId']]);

        // Delete the associated image file from the server, if it exists
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