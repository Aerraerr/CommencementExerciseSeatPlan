<?php

header("Content-Type: application/json");

$db = new PDO("sqlite:../database/seatplan.db");

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {

    echo json_encode([
        "success" => false,
        "message" => "No student ID."
    ]);

    exit;
}

$id = $data['id'];

$stmt = $db->prepare("
    DELETE FROM students
    WHERE id = ?
");

$success = $stmt->execute([$id]);

if ($success) {

    echo json_encode([
        "success" => true,
        "message" => "Student deleted successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Delete failed."
    ]);

}