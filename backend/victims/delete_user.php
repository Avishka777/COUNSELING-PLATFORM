<?php
require_once("../config/db.php");

if (isset($_GET['userId'])) {
    $stmt = $conn->prepare("DELETE FROM users WHERE userId = ?");
    $stmt->execute([$_GET['userId']]);
    echo json_encode(["message" => "User deleted"]);
} else {
    echo json_encode(["message" => "User ID required"]);
}
?>
