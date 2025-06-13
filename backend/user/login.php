<?php
require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"));

$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$data->username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($data->password, $user['password'])) {
    echo json_encode(["message" => "Login successful", "user" => $user]);
} else {
    echo json_encode(["message" => "Invalid username or password"]);
}
?>
