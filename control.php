<!DOCTYPE html>
<html>
<head>
    <title>BU Seat Plan</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div style="display:flex; align-items:center; justify-content:center; gap:15px; padding:15px; border-bottom:2px solid #ddd; margin-bottom:15px;">

    <img src="assets/img/BU-logo.png" alt="BU Logo"
         style="width:70px; height:70px; object-fit:contain;">

    <div style="text-align:center;">

        <h1 style="margin:0; font-size:22px;">
            Bicol University
        </h1>

        <h2 style="margin:0; font-size:18px; font-weight:bold;">
            Commencement Exercise 2026
        </h2>

        <p style="margin:0; font-size:12px; color:gray;">
            Graduation Seat Plan System
        </p>

    </div>

</div>

<div class="controls">
    <input type="file" id="excelFiles" multiple>
    <button onclick="uploadFiles()">Upload</button>
    <button onclick="loadFromServer()">Reload Saved Data</button>
</div>

<div id="seat-container">
    <div id="output"></div>

</div>

    <div style="display:flex; justify-content:flex-end; margin-top:15px;">
        <a href="libs/seatplan.html" target="_blank"
           style="padding:10px 16px; background: lightblue; color:black; text-decoration:none; border-radius:8px; font-size:13px; font-weight:600; box-shadow:0 3px 8px rgba(0,0,0,0.15); transition: all 0.2s ease; display:inline-block;
           "
           onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.25)'"
           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 8px rgba(0,0,0,0.15)'">
            View Seat Plan
        </a>
    </div>
<div id="student-info" class="info-card">
    <h3>🎓 Selected Seat</h3>

    <div class="info-row">
        <span class="label">Seat No</span>
        <span class="value" id="info-seat">—</span>
    </div>

    <div class="info-row">
        <span class="label">Name</span>
        <span class="value" id="info-name">—</span>
    </div>

    <div class="info-row">
        <span class="label">Course</span>
        <span class="value" id="info-course">—</span>
    </div>

    <div class="info-row">
        <span class="label" style="font-style: italic; color: #999;"></span>
        <span class="value" id="info-note" style="font-style: italic; color: red; font-size: 13px;">
            Note: Each student is entitled to 1 extra seat for a Parent, Guardian, etc.
        </span>
    </div>


</div>


<div class="table-container">

<div class="table-header">
    <h3>Student List</h3>

    <div style="display:flex; gap:10px; align-items:center;">
        
        <!-- SORT DROPDOWN -->
        <select id="sortMode" onchange="applySort()" style="padding:5px;">
            <option value="course">Sort by Course</option>
            <option value="cluster">Sort by Cluster</option>
            <option value="name">Sort by Name</option>
        </select>

        <!-- SEARCH -->
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search student name..." onkeyup="searchStudent()">
        </div>

    </div>
</div>
    <table id="student-list">
        <thead>
            <tr>
                <th>Seat No</th>
                <th>Name</th>
                <th>Course</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

</div>
<script src="assets/libs/xlsx.full.min.js"></script>
<script src="assets/js/control.js"></script>

</body>
</html>
