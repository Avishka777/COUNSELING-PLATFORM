<?php
require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $stmt = $conn->prepare("INSERT INTO users (username, password, age, occupation, role) VALUES (?, ?, ?, ?, ?)");
    $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
    $stmt->execute([$data->username, $hashedPassword, $data->age, $data->occupation, $data->role]);

    echo json_encode(["message" => "User registered successfully"]);
} else {
    echo json_encode(["message" => "Username and password required"]);
}
?>
