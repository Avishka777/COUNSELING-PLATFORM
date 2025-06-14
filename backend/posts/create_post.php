<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get data from request
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (empty($data['userId']) || empty($data['title']) || empty($data['description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User ID, title and description are required"]);
        exit;
    }

    try {
        // Handle image upload if present
        $imagePath = null;
        if (!empty($data['image'])) {
            $imageData = $data['image'];
            $imageName = uniqid() . '.png'; 
            
            // Save base64 image to file
            $uploadDir = "../../uploads/posts/";
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            file_put_contents($uploadDir . $imageName, base64_decode($imageData));
            $imagePath = $imageName;
        }

        // Insert post into database
        $stmt = $conn->prepare("INSERT INTO posts (userId, is_anonymous, image, title, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['userId'],
            $data['is_anonymous'] ?? false,
            $imagePath,
            $data['title'],
            $data['description']
        ]);

        $postId = $conn->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Post created successfully",
            "postId" => $postId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}

?>