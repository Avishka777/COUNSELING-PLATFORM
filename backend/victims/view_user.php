<?php
require_once("../config/db.php");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if (isset($_GET['userId'])) {
    try {
        $stmt = $conn->prepare("SELECT * FROM victims WHERE userId = ?");
        $stmt->execute([$_GET['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            echo json_encode(["message" => "User not found"]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "User ID required"]);
}
?>