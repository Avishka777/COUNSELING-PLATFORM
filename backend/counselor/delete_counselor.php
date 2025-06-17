<?php
require_once("../config/db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $counselorId = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if (!$counselorId) {
            http_response_code(400);
            echo json_encode(["error" => "Counselor ID required"]);
            exit();
        }

        // First get photo path to delete file
        $stmt = $conn->prepare("SELECT photo FROM counselors WHERE counselorId = ?");
        $stmt->execute([$counselorId]);
        $counselor = $stmt->fetch();

        // Delete counselor record
        $stmt = $conn->prepare("DELETE FROM counselors WHERE counselorId = ?");
        $stmt->execute([$counselorId]);
        
        if ($stmt->rowCount() > 0) {
            // Delete photo file if exists
            if (!empty($counselor['photo'])) {
                $photoPath = $_SERVER['DOCUMENT_ROOT'] . '/Counseling%20System/uploads/' . $counselor['photo'];
                if (file_exists($photoPath)) {
                    unlink($photoPath);
                }
            }
            
            echo json_encode(["message" => "Counselor deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Counselor not found"]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>