document.getElementById("studentForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const phone = document.getElementById("whatsapp").value;

    if(phone.length !== 10) {
        alert("Phone number must be exactly 10 digits");
        return;
    }

    const data = {

        firstName: document.getElementById("firstName").value,

        lastName: document.getElementById("lastName").value,

        domain: document.getElementById("domain").value,

        whatsapp: phone,

        email: document.getElementById("email").value,

        tenure: document.getElementById("tenure").value + " Months",

        joiningDate: document.getElementById("joiningDate").value
    };

    const response = await fetch("/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    const result = await response.json();

    document.getElementById("result").innerHTML =
        "Generated Employee ID: " + result.employeeId;

});