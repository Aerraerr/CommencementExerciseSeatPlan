function confirmEraseData() {

    const confirmAction = confirm(
        "⚠️ WARNING: This will delete ALL student data.\n\nDo you want to reset data for Day 1?"
    );

    if (!confirmAction) return;

    eraseAllData();
}


function eraseAllData() {

    fetch("library/erase.php", {
        method: "POST"
    })

    .then(response => response.json())
    .then(data => {

        if (data.success) {
            alert("All data has been reset (Day 1 cleared).");
            loadFromServer();
        } else {
            alert(data.message || "Failed to erase data.");
        }

    })

    .catch(error => {
        console.error(error);
        alert("Error deleting data.");
    });
}