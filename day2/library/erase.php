<?php

header('Content-Type: application/json');

try {

    $db = new PDO("sqlite:../../database/seatplan.db");

    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("DELETE FROM studentsDay2");

    $db->exec("DELETE FROM sqlite_sequence WHERE name='studentsDay2'");

echo json_encode([
    "success" => true,
    "message" => "Database reset successfully."
]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}