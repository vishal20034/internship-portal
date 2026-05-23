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

function generateEmployeeId(domain) {

    const uniqueCode = Math.floor(1000 + Math.random() * 9000);

    return `TEN/${domain.toUpperCase()}/${uniqueCode}`;
}

app.post("/register", async (req, res) => {

    try {

        const {
            FirstName,
            LastName,
            domain,
            whatsapp,
            email,
            tenure,
            joiningDate
        } = req.body;

        const employeeId = generateEmployeeId(domain);

        const newStudent = new Student({
            firstName: FirstName,
            lastName: LastName,
            domain,
            whatsapp,
            email,
            tenure,
            joiningDate,
            employeeId
        });

        await newStudent.save();

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

app.listen(5000, () => {
    console.log("Server running on port 5000");
});