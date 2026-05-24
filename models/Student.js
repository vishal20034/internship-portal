const mongoose = require("mongoose");

const studentsSchema = new mongoose.Schema({

    firstName: String,

    lastName: String,

    domain: String,

    whatsapp: String,

    email: String,

    tenure: String,

    joiningDate: String,

    employeeId: String

}, {
    timestamps: true
});

module.exports = mongoose.model("Student", studentsSchema);