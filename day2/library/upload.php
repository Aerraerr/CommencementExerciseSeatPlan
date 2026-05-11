<?php

header("Content-Type: application/json");

require_once "../../library/SimpleXLSX.php";

use Shuchkin\SimpleXLSX;

$db = new PDO("sqlite:../../database/seatplan.db");

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {

    if (!isset($_FILES['files'])) {
        throw new Exception("No files uploaded.");
    }

    $seatNo = 1;

    $last = $db->query("
        SELECT MAX(seat_no) as maxSeat
        FROM studentsDay2
    ")->fetch(PDO::FETCH_ASSOC);

    if ($last['maxSeat']) {
        $seatNo = $last['maxSeat'] + 1;
    }

    foreach ($_FILES['files']['tmp_name'] as $key => $tmpName) {

        $fileName = $_FILES['files']['name'][$key];

        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if ($extension == "xlsx") {

            if ($xlsx = SimpleXLSX::parse($tmpName)) {

                $rows = $xlsx->rows();

                foreach ($rows as $index => $row) {

                    if ($index == 0) continue;

                    $name = trim($row[0] ?? '');
                    $course = trim($row[1] ?? '');
                    $college = trim($row[2] ?? '');

                    if ($name == '') continue;

                    $stmt = $db->prepare("
                        INSERT INTO studentsDay2
                        (seat_no, name, course, college)
                        VALUES (?, ?, ?, ?)
                    ");

                    $stmt->execute([
                        $seatNo,
                        $name,
                        $course,
                        $college
                    ]);

                    $seatNo++;
                }
            }
        }
    }

echo json_encode([
    "success" => true,
    "message" => "Files uploaded successfully."
]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

}