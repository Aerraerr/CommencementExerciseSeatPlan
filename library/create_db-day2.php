<?php

$dbPath = "../database/seatplan-day2.db";

if (!file_exists("../database")) {
    mkdir("../database", 0777, true);
}

$db = new PDO("sqlite:" . $dbPath);

$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$db->exec("
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seat_no INTEGER,
    name TEXT,
    course TEXT,
    college TEXT
)
");

echo "Database and table created.";