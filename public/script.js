document
.getElementById("studentForm")
.addEventListener("submit", async function(e) {

e.preventDefault();

const form =
document.getElementById("studentForm");

const submitBtn =
document.getElementById("submitBtn");

const email =
document.getElementById("email").value;

// Gmail validation
const gmailPattern =
/^[a-z0-9._%+-]+@gmail\.com$/;

if (!gmailPattern.test(email)) {

alert("Enter valid Gmail ID");

return;

}

// Disable button
submitBtn.disabled = true;

submitBtn.innerText = "Submitting...";

const data = {

firstName:
document.getElementById("firstName").value,

lastName:
document.getElementById("lastName").value,

domain:
document.getElementById("domain").value,

whatsapp:
document.getElementById("whatsapp").value,

email:
document.getElementById("email").value,

tenure:
document.getElementById("tenure").value,

joiningDate:
document.getElementById("joiningDate").value

};

try {

const response =
await fetch("/register", {

method: "POST",

headers: {

"Content-Type":
"application/json"

},

body: JSON.stringify(data)

});

const result =
await response.json();

document.getElementById("result")
.innerHTML =

"Generated Employee ID: "
+ result.employeeId;

// CLEAR FORM
form.reset();

// Button reset
submitBtn.disabled = false;

submitBtn.innerText = "Submit";

}
catch(error) {

console.log(error);

alert("Something went wrong");

submitBtn.disabled = false;

submitBtn.innerText = "Submit";

}

});