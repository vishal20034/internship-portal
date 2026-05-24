const path = require("path");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
require("nodemailer");

const Student = require("./models/Student");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    auth: {
        user: "ac5ad1001@smtp-brevo.com",
        pass: "ESQakY0j5JbNIUGt"
    }
});
transporter.verify(function(error, success) {

    if (error) {

        console.log(error);

    } else {

        console.log("Email Server Ready");

    }

});



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
console.log("Student Saved");

await transporter.sendMail({

    from: "ten.internshipportal@gmail.com",

    to: email,

    subject: "Test Mail",

    text: "Mail Working"

});

console.log("Mail Sent");

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
app.post("/upload-excel", upload.single("excelFile"), async (req, res) => {

    try {

        const workbook = XLSX.readFile(req.file.path);

        const sheetName = workbook.SheetNames[0];

        const sheetData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
        );

        let generatedData = [];

        for (let i = 0; i < sheetData.length; i++) {

            const student = sheetData[i];

            const domain =
                student.domain.toUpperCase();

            const employeeId =
                `TEN/${domain}/${1000 + i}`;

            const newStudent = new Student({

                firstName: student.firstName,

                lastName: student.lastName,

                domain: student.domain,

                whatsapp: student.whatsapp,

                email: student.email,

                tenure: student.tenure,

                joiningDate: student.joiningDate,

                employeeId: employeeId

            });

            await newStudent.save();
            await transporter.sendMail({

    from: '"The Entrepreneurship Network" <ten.internshipportal@gmail.com>',

    to: student.email,

    subject: "Internship Registration Successful",

    text: `Hello ${student.firstName},

Your internship registration is successful.

Employee ID: ${employeeId}

Domain: ${student.domain}

Tenure: ${student.tenure} Months

Joining Date: ${student.joiningDate}

Thank You,
The Entrepreneurship Network`

});

            generatedData.push({

                name:
                    student.firstName + " " + student.lastName,

                employeeId: employeeId

            });

        }

        res.json({

            success: true,

            data: generatedData

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Excel Upload Failed"

        });

    }

});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/students", async (req, res) => {

    try {

        const students = await Student.find().sort({ createdAt: -1 });

        res.json(students);

    } 
    
    catch (error) {

        res.status(500).json({
            message: "Error fetching students"
        });

    }

});

// Start Server
const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});