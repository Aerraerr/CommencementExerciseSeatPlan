<?php

header("Content-Type: application/json");

require_once __DIR__ . "/SimpleXLSX.php";

use Shuchkin\SimpleXLSX;

$db = new PDO("sqlite:../database/seatplan.db");

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {

    if (!isset($_FILES['files'])) {
        throw new Exception("No files uploaded.");
    }

    $seatNo = 1;

    // GET LAST SEAT NUMBER
    $last = $db->query("SELECT MAX(seat_no) as maxSeat FROM students")
               ->fetch(PDO::FETCH_ASSOC);

    if ($last['maxSeat']) {
        $seatNo = $last['maxSeat'] + 1;
    }

    foreach ($_FILES['files']['tmp_name'] as $key => $tmpName) {

        $fileName = $_FILES['files']['name'][$key];
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // ================= TXT FILE =================
        if ($extension == "txt") {

            $lines = file($tmpName);

            foreach ($lines as $line) {

                $data = explode(",", trim($line));

                if (count($data) >= 3) {

                    $name = trim($data[0]);
                    $course = trim($data[1]);
                    $college = trim($data[2]);

                    $stmt = $db->prepare("
                        INSERT INTO students (seat_no, name, course, college)
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

        // ================= XLSX FILE =================
        else if ($extension == "xlsx") {

            if ($xlsx = SimpleXLSX::parse($tmpName)) {

                $rows = $xlsx->rows();

                foreach ($rows as $index => $row) {

                    // SKIP HEADER
                    if ($index == 0) continue;

                    $name = trim($row[0] ?? '');
                    $course = trim($row[1] ?? '');
                    $college = trim($row[2] ?? '');

                    if ($name == '') continue;

                    $stmt = $db->prepare("
                        INSERT INTO students (seat_no, name, course, college)
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

            } else {
                throw new Exception(SimpleXLSX::parseError());
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