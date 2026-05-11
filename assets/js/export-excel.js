function exportExcel() {

    let type = document.getElementById("exportType").value;
    let value = document.getElementById("exportValue").value.toLowerCase();

    let students = generateSeatData(globalStudents);

    let wb = XLSX.utils.book_new();

    // ================= ALL =================

    if (type === "all") {

        let ws = XLSX.utils.json_to_sheet(format(students));
        XLSX.utils.book_append_sheet(wb, ws, "All Students");

    }

    // ================= CLUSTER (4 SHEETS) =================

    else if (type === "cluster") {

        let clusters = {
            A: [],
            B: [],
            C: [],
            D: []
        };

        students.forEach(s => clusters[s.cluster].push(s));

        Object.keys(clusters).forEach(key => {

            let ws = XLSX.utils.json_to_sheet(format(clusters[key]));

            XLSX.utils.book_append_sheet(wb, ws, `Cluster ${key}`);

        });

    }

    // ================= COURSE (MULTI SHEETS) =================
// ================= COURSE (MULTI SHEETS) =================

else if (type === "course") {

    let courses = {};

    students.forEach(s => {

        // FIX: safely get course name
        let key = (s.course || "Unknown").trim();

        // Create array if not existing
        if (!courses[key]) {
            courses[key] = [];
        }

        // Push student
        courses[key].push({
            seat: s.seat,
            name: s.name,
            course: s.course,
            college: s.college,
            cluster: s.cluster
        });

    });

    console.log(courses); // DEBUG

    // Create sheets
    Object.keys(courses).forEach(course => {

        let ws = XLSX.utils.json_to_sheet(format(courses[course]));

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            safeSheetName(course)
        );

    });

}
    // ================= COLLEGE (MULTI SHEETS) =================

    else if (type === "college") {

        let colleges = {};

        students.forEach(s => {

            let key = s.college || "Unknown";

            if (!colleges[key]) colleges[key] = [];

            colleges[key].push(s);

        });

        Object.keys(colleges).forEach(college => {

            let ws = XLSX.utils.json_to_sheet(format(colleges[college]));

            XLSX.utils.book_append_sheet(wb, ws, safeSheetName(college));

        });

    }

    XLSX.writeFile(wb, "[DAY 1] List of Student Graduates - S.Y 2025 - 2026.xlsx");

    closeExportModal();
}



function format(data) {
    return data.map(s => ({
        Seat: s.seat,
        Name: s.name,
        Course: s.course,
        College: s.college,
        Cluster: s.cluster
    }));
}

// Excel sheet name limit fix (31 chars max + no symbols)
function safeSheetName(name) {
    return name
        .toString()
        .replace(/[\\\/\?\*\[\]:]/g, "")
        .substring(0, 31);
}