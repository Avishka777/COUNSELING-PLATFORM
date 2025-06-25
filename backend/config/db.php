<?php
// Define database connection parameters
$host = "localhost";
$db_name = "counselling";
$username = "root";
$password = "";

try {
    // Create a new PDO instance for database connection
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Set the PDO error mode to exception to handle errors properly
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>