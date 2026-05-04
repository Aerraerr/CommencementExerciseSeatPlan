// GLOBAL STORAGE
let globalStudents = [];
let currentSort = "course"; // ✅ DEFAULT VIEW

// ================= UPLOAD FILES =================
function uploadFiles() {
    const files = document.getElementById('excelFiles').files;

    if (files.length === 0) {
        alert("Select files");
        return;
    }

    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files[]", files[i]);
    }

    fetch("libs/upload.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(() => {
        alert("Uploaded successfully!");
        loadFromServer();
    });
}

// ================= LOAD FROM SERVER =================
function loadFromServer() {
    fetch("libs/load-json.php")
        .then(res => res.json())
        .then(data => {

            if (!data || data.length === 0) {
                loadFromExcel();
            } else {
                globalStudents = data;

                // ✅ ALWAYS SET DEFAULT VIEW
                setDefaultSort();

                distributeStudents(globalStudents);
            }
        });
}

// ================= DEFAULT SORT FIX =================
function setDefaultSort() {
    const dropdown = document.getElementById("sortMode");
    if (dropdown) {
        dropdown.value = "course";
    }
    currentSort = "course";
}

// ================= LOAD FROM EXCEL =================
function loadFromExcel() {
    fetch("libs/load.php")
        .then(res => res.json())
        .then(files => {
            let allStudents = [];
            let loaded = 0;

            if (files.length === 0) {
                document.getElementById("output").innerHTML = "No data yet.";
                return;
            }

            files.forEach(file => {
                fetch("data/" + file)
                    .then(res => res.arrayBuffer())
                    .then(data => {
                        const workbook = XLSX.read(data);
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const json = XLSX.utils.sheet_to_json(sheet);

                        allStudents = allStudents.concat(json);

                        loaded++;
                        if (loaded === files.length) {
                            globalStudents = allStudents;

                            saveToServer();

                            setDefaultSort(); // ✅ FIX

                            distributeStudents(globalStudents);
                        }
                    });
            });
        });
}

// ================= SAVE =================
function saveToServer() {
    fetch("libs/save.php", {
        method: "POST",
        body: JSON.stringify(globalStudents)
    });
}

// ================= SORT HANDLER =================
function applySort() {
    currentSort = document.getElementById("sortMode").value;
    distributeStudents(globalStudents);
}

// ================= DISTRIBUTE =================
function distributeStudents(students) {
    const clusters = { A: [], B: [], C: [], D: [] };
    let rowIndex = 0;

    while (rowIndex < students.length) {
        let row = students.slice(rowIndex, rowIndex + 80);
        let A = row.slice(0, 20);
        let B = row.slice(20, 40);
        let C = row.slice(40, 60);
        let D = row.slice(60, 80);
        processRow(clusters, A, B, C, D);
        rowIndex += 80;
    }

    render(clusters);
    buildList(clusters);
}

// ================= PROCESS ROW =================
function processRow(clusters, A, B, C, D) {
    let aStart = clusters.A.length;
    let bStart = clusters.B.length;
    let cStart = clusters.C.length;
    let dStart = clusters.D.length;

    for (let i = 0; i < A.length; i++)
        clusters.A.push({ ...A[i], seat: "A" + (aStart + 20 - i) });

    for (let i = 0; i < B.length; i++)
        clusters.B.push({ ...B[i], seat: "B" + (bStart + 20 - i) });

    for (let i = 0; i < C.length; i++)
        clusters.C.push({ ...C[i], seat: "C" + (cStart + i + 1) });

    for (let i = 0; i < D.length; i++)
        clusters.D.push({ ...D[i], seat: "D" + (dStart + i + 1) });
}

// ================= RENDER =================
function render(clusters) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    const stage = document.createElement("div");
    stage.className = "stage";
    stage.innerText = "STAGE";
    output.appendChild(stage);

    const wrapper = document.createElement("div");
    wrapper.className = "seat-wrapper";

    ["A", "B", "C", "D"].forEach(key => {
        const clusterDiv = document.createElement("div");
        clusterDiv.className = `cluster-box ${key}`;

        const title = document.createElement("div");
        title.className = "cluster-title";
        title.innerText = `Cluster ${key}`;

        const grid = document.createElement("div");
        grid.className = "grid";

        clusters[key].forEach(student => {
            const seat = document.createElement("div");
            seat.className = "seat";

            seat.innerHTML = `<div class="seat-code">${student.seat}</div>`;

            seat.addEventListener("click", () => {
                document.querySelectorAll(".seat").forEach(s => s.classList.remove("selected"));
                seat.classList.add("selected");
                showInfo(student);
            });

            grid.appendChild(seat);
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
}

// ================= SHOW INFO =================
function showInfo(student) {
    document.getElementById("info-seat").innerText = student.seat;
    document.getElementById("info-name").innerText = student.Name || "Unknown";
    document.getElementById("info-course").innerText = student.Course || "N/A";
}

// ================= DELETE =================
function deleteStudent(index) {
    if (!confirm("Delete this student?")) return;

    globalStudents.splice(index, 1);

    saveToServer();

    distributeStudents(globalStudents);
}

// ================= BUILD LIST =================
function buildList(clusters) {
    const tbody = document.querySelector("#student-list tbody");
    tbody.innerHTML = "";

    let allStudents = Object.values(clusters).flat();

    function getSeatNumber(seat) {
        return parseInt(seat.replace(/[A-Za-z]/g, "")) || 0;
    }

    // ================= NAME VIEW =================
    if (currentSort === "name") {
        allStudents.sort((a, b) =>
            (a.Name || "").localeCompare(b.Name || "")
        );

        allStudents.forEach(s => {
            let index = globalStudents.findIndex(gs =>
                gs.Name === s.Name && gs.Course === s.Course
            );

            tbody.innerHTML += `
                <tr>
                    <td>${s.seat}</td>
                    <td>${s.Name || "Unknown"}</td>
                    <td>${s.Course || "N/A"}</td>
                    <td><button onclick="deleteStudent(${index})">🗑️</button></td>
                </tr>
            `;
        });

        return;
    }

    // ================= CLUSTER VIEW =================
    if (currentSort === "cluster") {

        ["A", "B", "C", "D"].forEach(key => {

            tbody.innerHTML += `
                <tr><td colspan="4" style="background:#ccc;font-weight:bold;">Cluster ${key}</td></tr>
            `;

            clusters[key].forEach(s => {
                let index = globalStudents.findIndex(gs =>
                    gs.Name === s.Name && gs.Course === s.Course
                );

                tbody.innerHTML += `
                    <tr>
                        <td>${s.seat}</td>
                        <td>${s.Name || "Unknown"}</td>
                        <td>${s.Course || "N/A"}</td>
                        <td><button onclick="deleteStudent(${index})">🗑️</button></td>
                    </tr>
                `;
            });
        });

        return;
    }

    // ================= DEFAULT COURSE VIEW =================
    allStudents.sort((a, b) => {
        let nameA = (a.Name || "").toLowerCase();
        let nameB = (b.Name || "").toLowerCase();

        if (nameA !== nameB) return nameA.localeCompare(nameB);

        return getSeatNumber(a.seat) - getSeatNumber(b.seat);
    });

    let courseOrder = [];

    allStudents.forEach(s => {
        let course = s.Course || "N/A";
        if (!courseOrder.includes(course)) courseOrder.push(course);
    });

    courseOrder.forEach(course => {

        tbody.innerHTML += `
            <tr><td colspan="4" style="background:#ddd;font-weight:bold;">${course}</td></tr>
        `;

        allStudents
            .filter(s => (s.Course || "N/A") === course)
            .forEach(s => {

                let index = globalStudents.findIndex(gs =>
                    gs.Name === s.Name && gs.Course === s.Course
                );

                tbody.innerHTML += `
                    <tr>
                        <td>${s.seat}</td>
                        <td>${s.Name || "Unknown"}</td>
                        <td>${s.Course || "N/A"}</td>
                        <td><button onclick="deleteStudent(${index})">🗑️</button></td>
                    </tr>
                `;
            });
    });
}

// ================= SEARCH =================
function searchStudent() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#student-list tbody tr");

    rows.forEach(row => {
        const nameCell = row.cells[1];
        if (!nameCell) return;

        row.style.display = nameCell.textContent.toLowerCase().includes(input)
            ? ""
            : "none";
    });
}

// ================= AUTO LOAD =================
window.onload = loadFromServer;