<?php
require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"));

if (isset($data->userId)) {
    $stmt = $conn->prepare("UPDATE users SET username = ?, age = ?, occupation = ?, role = ? WHERE userId = ?");
    $stmt->execute([$data->username, $data->age, $data->occupation, $data->role, $data->userId]);
    echo json_encode(["message" => "User updated"]);
} else {
    echo json_encode(["message" => "User ID required"]);
}
?>
