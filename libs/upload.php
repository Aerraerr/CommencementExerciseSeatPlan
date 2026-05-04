<?php
$targetDir = "../data/";

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (!empty($_FILES['files'])) {
    foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
        $fileName = basename($_FILES['files']['name'][$key]);
        $targetFile = $targetDir . $fileName;
        move_uploaded_file($tmp_name, $targetFile);
    }
    echo json_encode(["status" => "success"]);
}

