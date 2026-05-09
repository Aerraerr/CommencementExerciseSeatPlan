<?php

header('Content-Type: application/json');

try {

    $db = new PDO("sqlite:../database/seatplan.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // DELETE ALL DATA
    $db->exec("DELETE FROM students");

    // RESET AUTOINCREMENT
    $db->exec("DELETE FROM sqlite_sequence WHERE name='students'");

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