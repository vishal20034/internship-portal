document.getElementById("studentForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const data = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        domain: document.getElementById("domain").value,
        whatsapp: document.getElementById("whatsapp").value,
        email: document.getElementById("email").value,
        tenure: document.getElementById("tenure").value,
        joiningDate: document.getElementById("joiningDate").value
    };

    try {

        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log(result);

        document.getElementById("result").innerHTML =
            "Generated Employee ID: " + result.employeeId;

    } catch (error) {

        console.log(error);

        document.getElementById("result").innerHTML =
            "Error generating Employee ID";

    }

});