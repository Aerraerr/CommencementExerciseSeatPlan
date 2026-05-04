<?php
$dir = "../data/";
if (!file_exists($dir)) mkdir($dir, 0777, true);
$files = array_diff(scandir($dir), array('.', '..'));
echo json_encode(array_values($files));
