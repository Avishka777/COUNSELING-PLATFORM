<?php
require_once("../config/db.php");

if (isset($_GET['userId'])) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE userId = ?");
    $stmt->execute([$_GET['userId']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($user);
} else {
    echo json_encode(["message" => "User ID required"]);
}
?>
