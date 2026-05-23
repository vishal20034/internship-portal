const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    firstName: String,

    lastName: String,

    domain: String,

    whatsapp: String,

    email: String,

    tenure: String,

    joiningDate: String,

    employeeId: String

});

module.exports = mongoose.model("Student", studentSchema);