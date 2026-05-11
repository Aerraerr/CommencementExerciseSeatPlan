<?php

header("Content-Type: application/json");

$db = new PDO("sqlite:../database/seatplan.db");

$result = $db->query("
    SELECT
        id,
        seat_no,
        name,
        course,
        college
    FROM students
    ORDER BY seat_no ASC
");

$data = $result->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);