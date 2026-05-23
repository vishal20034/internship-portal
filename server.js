const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://nagbishal07_db_user:_DXMzR6bkF!7Bc9@ac-kbv0ma9-shard-00-00.dtg7de6.mongodb.net:27017,ac-kbv0ma9-shard-00-01.dtg7de6.mongodb.net:27017,ac-kbv0ma9-shard-00-02.dtg7de6.mongodb.net:27017/?ssl=true&replicaSet=atlas-ekamxn-shard-0&authSource=admin&appName=Cluster0")

.then(() => console.log("MongoDB Connected"))

.catch((err) => console.log(err));


// Generate Employee ID
async function generateEmployeeId(domain) {

    // Count total students
    const totalStudents =
    await Student.countDocuments();

    // Sequence number
    const sequenceNumber =
    1001 + totalStudents;

    // Employee ID format
    return `TEN/${domain.toUpperCase()}/${sequenceNumber}`;
}


// Register API
app.post("/register", async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            domain,
            whatsapp,
            email,
            tenure,
            joiningDate
        } = req.body;

        // Generate Employee ID
        const employeeId =
        await generateEmployeeId(domain);

        // Save Student
        const newStudent = new Student({

            firstName,
            lastName,
            domain,
            whatsapp,
            email,
            tenure,
            joiningDate,
            employeeId

        });

        await newStudent.save();

        // Send Response
        res.json({

            success: true,

            employeeId: employeeId

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

});


// Start Server
const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});