let globalStudents = [];

// ====================== UPLOAD FILES ======================

function uploadFiles() {

    const input = document.getElementById("excelFiles");

    if (input.files.length === 0) {
        alert("Please select files.");
        return;
    }

    let formData = new FormData();

    for (let i = 0; i < input.files.length; i++) {
        formData.append("files[]", input.files[i]);
    }

    fetch("library/upload.php", {
        method: "POST",
        body: formData
    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            alert(data.message);

            loadFromServer();

        } else {

            alert(data.message);

        }

    })

    .catch(error => {

        console.error(error);

        alert("Upload failed.");

    });

}

// ====================== LOAD DATA ======================

function loadFromServer() {

    fetch("library/load.php")

    .then(response => response.json())

    .then(data => {

        globalStudents = data;

        const studentsWithSeats = generateSeatData(data);

        renderTable(studentsWithSeats);

        renderSeatPlan(studentsWithSeats);

    })

    .catch(error => {

        console.error(error);

    });

}

// ====================== GENERATE SEAT DATA ======================

function generateSeatData(students) {

    const clusters = {
        A: [],
        B: [],
        C: [],
        D: []
    };

    let { executives, others } = prioritizeExecutives(students);

    let rowIndex = 0;

    // EXECUTIVES
    executives.slice().reverse().forEach((exec, i) => {

        clusters.B.push({
            ...exec,
            seat: "B-EXEC-" + (20 - i),
            cluster: "B",
            isExecutive: true
        });

    });

    // NORMAL DISTRIBUTION
    while (rowIndex < others.length) {

        let row = others.slice(rowIndex, rowIndex + 80);

        let A = row.slice(0, 20).reverse();

        let B = row.slice(20, 40).reverse();

        let C = row.slice(40, 60);

        let D = row.slice(60, 80);

        processRow(clusters, A, B, C, D);

        rowIndex += 80;

    }

    return [
        ...clusters.A,
        ...clusters.B,
        ...clusters.C,
        ...clusters.D
    ];

}

// ====================== PRIORITIZE EXECUTIVES ======================

function prioritizeExecutives(students) {

    let executives = [];

    let others = [];

    students.forEach(student => {

        const course = (student.course || "").toLowerCase();

        if (course.includes("executive")) {

            executives.push(student);

        } else {

            others.push(student);

        }

    });

    return {
        executives,
        others
    };

}

// ====================== PROCESS ROW ======================

function processRow(clusters, A, B, C, D) {

    let aStart = clusters.A.length;

    let bStart = clusters.B.length;

    let cStart = clusters.C.length;

    let dStart = clusters.D.length;

    // A
    for (let i = 0; i < A.length; i++) {

        clusters.A.push({
            ...A[i],
            seat: "A" + (aStart + 20 - i),
            cluster: "A"
        });

    }

    // B
    for (let i = 0; i < B.length; i++) {

        clusters.B.push({
            ...B[i],
            seat: "B" + (bStart + 20 - i),
            cluster: "B"
        });

    }

    // C
    for (let i = 0; i < C.length; i++) {

        clusters.C.push({
            ...C[i],
            seat: "C" + (cStart + i + 1),
            cluster: "C"
        });

    }

    // D
    for (let i = 0; i < D.length; i++) {

        clusters.D.push({
            ...D[i],
            seat: "D" + (dStart + i + 1),
            cluster: "D"
        });

    }

}

// ====================== TABLE ======================

function renderTable(students, grouped = false) {

    const tbody = document.querySelector("#student-list tbody");

    tbody.innerHTML = "";

    // ====================== NORMAL ======================

    if (!grouped) {

        students.forEach(student => {

            tbody.innerHTML += `
                <tr>

                    <td>${student.seat}</td>

                    <td>${student.name}</td>

                    <td>${student.course}</td>

                    <td>${student.college}</td>

                    <td style="display:flex; gap:5px;">

                        <button onclick='showInfo(${JSON.stringify(student)})'>
                            View
                        </button>

                        <button onclick='deleteStudent(${student.id})'>
                            <i class="fa-solid fa-trash"></i>
                        </button>       

                    </td>

                </tr>
            `;

        });

        return;

    }

    // ====================== GROUPED ======================

    const groupedStudents = {
        A: [],
        B: [],
        C: [],
        D: []
    };

    students.forEach(student => {

        groupedStudents[student.cluster].push(student);

    });

    ["A", "B", "C", "D"].forEach(cluster => {

        if (groupedStudents[cluster].length === 0) return;

        tbody.innerHTML += `
            <tr class="cluster-header">
                <td colspan="5">
                    Cluster ${cluster}
                </td>
            </tr>
        `;

        groupedStudents[cluster].forEach(student => {

            tbody.innerHTML += `
                <tr>

                    <td>${student.seat}</td>

                    <td>${student.name}</td>

                    <td>${student.course}</td>

                    <td>${student.college}</td>

                    <td style="display:flex; gap:5px;">

                        <button onclick='showInfo(${JSON.stringify(student)})'>
                            View
                        </button>

                        <button onclick='deleteStudent(${student.id})'>
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        });

    });

}

// ====================== RENDER SEATPLAN ======================

function renderSeatPlan(students) {

    const output = document.getElementById("output");

    output.innerHTML = "";

    const stage = document.createElement("div");

    stage.className = "stage";

    stage.innerText = "STAGE";

    output.appendChild(stage);

    const wrapper = document.createElement("div");

    wrapper.className = "seat-wrapper";

    const grouped = {
        A: [],
        B: [],
        C: [],
        D: []
    };

    students.forEach(student => {

        grouped[student.cluster].push(student);

    });

    ["A", "B", "C", "D"].forEach(key => {

        const clusterDiv = document.createElement("div");

        clusterDiv.className = `cluster-box ${key}`;

        const title = document.createElement("div");

        title.className = "cluster-title";

        title.innerText = `Cluster ${key}`;

        const grid = document.createElement("div");

        grid.className = "grid";

grouped[key].forEach(student => {

    for (let i = 0; i < 2; i++) { //duplicate

        const seat = document.createElement("div");

        seat.className = "seat";

        seat.innerHTML = `
            <div class="seat-code">
                ${student.seat}
            </div>
        `;

        // EXECUTIVE COLOR
        if (student.isExecutive) {

            seat.style.backgroundColor = "#87CEFA";
            seat.style.color = "#000";
            seat.style.fontWeight = "bold";

        }

        // CLICK (same student)
        seat.addEventListener("click", () => {

            document
                .querySelectorAll(".seat")
                .forEach(s => s.classList.remove("selected"));

            seat.classList.add("selected");

            showInfo(student);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        grid.appendChild(seat);
    }

});

        clusterDiv.appendChild(title);

        clusterDiv.appendChild(grid);

        wrapper.appendChild(clusterDiv);

    });

    output.appendChild(wrapper);

    const grand = document.createElement("div");

    grand.className = "grandstand";

    grand.innerText = "GRANDSTAND";

    output.appendChild(grand);
    setTimeout(() => {

    const container = document.getElementById("seat-container");

    container.scrollLeft =
        (container.scrollWidth - container.clientWidth) / 2;

    }, 0);

}

// ====================== SHOW INFO ======================

function showInfo(student) {

    document.getElementById("info-seat").innerText =
        student.seat;

    document.getElementById("info-name").innerText =
        student.name;

    document.getElementById("info-course").innerText =
        student.course;

    document.getElementById("info-college").innerText =
        student.college;

}

// ====================== SEARCH ======================

function searchStudent() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const studentsWithSeats = generateSeatData(globalStudents);

    const filtered = studentsWithSeats.filter(student => {

        return student.name
            .toLowerCase()
            .includes(keyword);

    });

    renderTable(filtered);

    renderSeatPlan(filtered);

}

// ====================== SORT ======================

function applySort() {

    const mode = document.getElementById("sortMode").value;

    let students = generateSeatData(globalStudents);

    students.sort((a, b) => {

        if (mode === "name") {
            return a.name.localeCompare(b.name);
        }

        if (mode === "course") {
            return a.course.localeCompare(b.course);
        }

        if (mode === "college") {
            return a.college.localeCompare(b.college);
        }

        if (mode === "cluster") {
            return a.cluster.localeCompare(b.cluster);
        }

        return a.seat.localeCompare(b.seat);

    });

    if (mode === "cluster") {

        renderTable(students, true);

    } else {

        renderTable(students);

    }

    renderSeatPlan(students);

}

// ====================== DELETE STUDENT ======================

function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    fetch("library/delete.php", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            id: id
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            alert(data.message);

            loadFromServer();

        } else {

            alert(data.message);

        }

    })

    .catch(error => {

        console.error(error);

        alert("Delete failed.");

    });

}

// ====================== OPEN MODAL ======================

function openExportModal() {
    document.getElementById("exportModal").style.display = "flex";
}

function closeExportModal() {
    document.getElementById("exportModal").style.display = "none";
}
// ====================== AUTO LOAD ======================

loadFromServer();