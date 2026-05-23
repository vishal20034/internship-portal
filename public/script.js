document.getElementById("uploadExcelBtn").addEventListener("click", async () => {

    const fileInput = document.getElementById("excelFile");

    const file = fileInput.files[0];

    if (!file) {

        alert("Please choose Excel file");

        return;

    }

    const formData = new FormData();

    formData.append("excelFile", file);

    try {

        const response = await fetch("/upload-excel", {

            method: "POST",

            body: formData

        });

        const data = await response.json();

        console.log(data);

        if (data.success) {

            let message = "Employee IDs Generated:\n\n";

            data.data.forEach((item) => {

                message += `${item.name} : ${item.employeeId}\n`;

            });

            alert(message);

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.log(err);

        alert("Upload Failed");

    }

});