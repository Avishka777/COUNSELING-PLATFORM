<?php
require_once("../config/db.php");

$stmt = $conn->query("SELECT * FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
?>
