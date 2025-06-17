<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/db.php");

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Check for required fields
    if (empty($data['userId']) && empty($data['counselorId'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Either User ID or Counselor ID is required"]);
        exit;
    }

    if (empty($data['title']) || empty($data['description'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Title and description are required"]);
        exit;
    }

    try {
        $imagePath = null;
        if (!empty($data['image'])) {
            $imageData = $data['image'];
            $imageName = uniqid() . '.png'; 
            $uploadDir = "../../uploads/posts/";

            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            file_put_contents($uploadDir . $imageName, base64_decode($imageData));
            $imagePath = $imageName;
        }

        $stmt = $conn->prepare("INSERT INTO posts (userId, counselorId, is_anonymous, image, title, description) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['userId'] ?? null,  
            $data['counselorId'] ?? null, 
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
