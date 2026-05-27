const mongoose = require("mongoose");

const studentsSchema = new mongoose.Schema({

    firstName: String,

    lastName: String,

    domain: String,

    whatsapp: String,

    email: String,

    tenure: String,

    joiningDate: String,
    
    employeeId: String,

password: {
type: String,
default: "intern123"
}

}, {
    timestamps: true
});

module.exports = mongoose.model("Student", studentsSchema);
