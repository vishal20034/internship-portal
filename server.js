require("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");

const Student = require("./models/Student");
const Notice = require("./models/Notice");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: "uploads/" });

// ================= MAIL =================

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error)=>{

    if(error){
        console.log(error);
    }else{
        console.log("Email Server Ready");
    }

});

// ================= MONGODB =================

mongoose.connect("mongodb://nagbishal07_db_user:_DXMzR6bkF!7Bc9@ac-kbv0ma9-shard-00-00.dtg7de6.mongodb.net:27017,ac-kbv0ma9-shard-00-01.dtg7de6.mongodb.net:27017,ac-kbv0ma9-shard-00-02.dtg7de6.mongodb.net:27017/?ssl=true&replicaSet=atlas-ekamxn-shard-0&authSource=admin&appName=Cluster0")

.then(()=>console.log("MongoDB Connected"))
.catch((err)=>console.log(err));

// ================= SCHEMA =================

const submissionSchema = new mongoose.Schema({

    employeeId:String,

    domain:String,

    githubLink:String,

    note:String,

    image:String,

    pdf:String,

    feedback:{
        type:String,
        default:"No Feedback Yet"
    },

    status:{
        type:String,
        default:"Pending"
    },

    attendanceAllowed:{
        type:Boolean,
        default:false
    },

    attendanceGiven:{
        type:Boolean,
        default:false
    },

    attendanceCount:{
        type:Number,
        default:0
    },

    meetingsJoined:{
        type:Number,
        default:0
    },

    tasksCompleted:{
        type:Number,
        default:0
    },

    performance:{
        type:String,
        default:"B"
    },

    submittedAt:{
        type:Date,
        default:Date.now
    }

});

const Submission = mongoose.model("Submission",submissionSchema);

// ================= ROUTES =================

app.get("/dashboard", (req,res)=>{
    res.sendFile(path.join(__dirname,"public","dashboard.html"));
});

app.get("/groups", (req,res)=>{
    res.sendFile(path.join(__dirname,"public","groups.html"));
});

app.get("/edit.html", (req,res)=>{
    res.sendFile(path.join(__dirname,"public","edit.html"));
});

// ================= EMPLOYEE ID =================

async function generateEmployeeId(domain){

    const totalStudents =
    await Student.countDocuments();

    const sequenceNumber =
    1001 + totalStudents;

    return `TEN/${domain.toUpperCase()}/${sequenceNumber}`;

}

// ================= REGISTER =================

app.post("/register", async(req,res)=>{

try{

const {
firstName,
lastName,
domain,
whatsapp,
email,
tenure,
joiningDate
} = req.body;

const existingStudent =
await Student.findOne({
email 
});

if(existingStudent){

return res.json({
success:false,
already:true,
employeeId:existingStudent.employeeId
});

}

const employeeId =
await generateEmployeeId(domain);

const password =
crypto.randomBytes(4).toString("hex");

const newStudent = new Student({

firstName,
lastName,

name: firstName + " " + lastName,

domain,

whatsapp,
email,

tenure,
joiningDate,

employeeId,
password

});

await newStudent.save();

try{

await transporter.sendMail({

from:"TEN Internship Portal <ten.internshipportal@gmail.com>",

to:email,

subject:"Internship Registration Successful",

text:`

Hello ${firstName},

Your Internship Registration is Successful 🚀

Employee ID: ${employeeId}

Password: ${password}

Login:
http://13.235.150.76:5000/login.html

Thank You

`

});

}catch(mailError){

console.log("MAIL ERROR:",mailError);

}

res.json({
success:true,
employeeId
});

}catch(error){

console.log(error);

res.status(500).json({
success:false,
message:"Server Error"
});

}

});

// ================= LOGIN =================

app.post("/login", async(req,res)=>{

try{

const { employeeId,password } = req.body;

const student =
await Student.findOne({
employeeId,
password
});

if(!student){

return res.json({
success:false,
message:"Invalid Employee ID or Password"
});

}

res.json({
success:true,
student
});

}catch(error){

res.status(500).json({
success:false,
message:"Server Error"
});

}

});

// ================= SUBMIT TASK =================

app.post("/submit-task", upload.fields([
{ name:"image", maxCount:1 },
{ name:"pdf", maxCount:1 }
]), async(req,res)=>{

try{

const {
employeeId,
domain,
githubLink,
note
} = req.body;

const image =
req.files["image"]
? "/" + req.files["image"][0].path
: "";

const pdf =
req.files["pdf"]
? "/" + req.files["pdf"][0].path
: "";

const submission =
new Submission({
employeeId,
domain,
githubLink,
note,
image,
pdf,
status:"Pending",
attendanceAllowed:false,
attendanceGiven:false,

attendanceCount:0,

internshipDuration:"1 Month",

monthlyAttendance:{
month1:0,
month2:0,
month3:0,
month4:0,
month5:0,
month6:0
},

tasksCompleted:0,
meetingsJoined:0,
performance:"B"
});

await submission.save();
console.log("TASK SAVED");
console.log(submission);

res.json({
success:true,
message:"Task Submitted Successfully"
});

}catch(error){

console.log(error);

res.json({
success:false,
message:"Submission Failed"
});

}

});

// ================= STUDENT SUBMISSIONS =================

app.get("/student-submissions/:employeeId", async(req,res)=>{

try{

const employeeId = decodeURIComponent(req.params.employeeId);

const submissions = await Submission.find({
employeeId: employeeId
}).sort({ submittedAt:-1 });

res.json({
success:true,
submissions
});

}catch(error){

console.log(error);

res.json({
success:false,
submissions:[]
});

}

});

// ================= COORDINATOR DOMAIN SUBMISSIONS =================

app.get("/all-submissions/:domain", async(req,res)=>{

try{

const domain =
decodeURIComponent(req.params.domain);

const submissions =
await Submission.find({
domain:domain
}).sort({ submittedAt:-1 });

res.json(submissions);

}catch(error){

console.log(error);

res.json([]);

}

});

// ================= UPDATE STATUS =================

app.post("/update-status", async(req,res)=>{

try{

const { id,status,feedback } = req.body;

let performance = "B";

if(status === "Approved"){
performance = "A+";
}

await Submission.findByIdAndUpdate(
id,
{
status,
feedback,
attendanceAllowed: status === 
"Approved",
performance,

tasksCompleted:
status === "Approved" ? 1 : 0
},
{ new:true }
);

res.json({
success:true,
message:"Status Updated Successfully"
});

}catch(error){

console.log(error);

res.json({
success:false
});

}

});

// ================= ATTENDANCE =================

app.post("/give-attendance", async(req,res)=>{

try{

const { employeeId } = req.body;
console.log(employeeId);
const submission =
await Submission.findOne({
employeeId
}).sort({ submittedAt:-1 });

if(!submission){

return res.json({
success:false,
message:"Submit task first"
});

}

if(submission.status === "Pending"){

return res.json({
success:false,
message:"Coordinator has not responded yet"
});

}

if(submission.attendanceGiven){

return res.json({
success:false,
message:"Attendance already submitted"
});

}

submission.attendanceGiven = true;
submission.attendanceCount += 1;

if(submission.internshipDuration === "1 Month"){

submission.monthlyAttendance.month1 += 1;

}

else if(submission.internshipDuration === "3 Months"){

if(submission.monthlyAttendance.month1 < 20){

submission.monthlyAttendance.month1 += 1;

}
else if(submission.monthlyAttendance.month2 < 20){

submission.monthlyAttendance.month2 += 1;

}
else{

submission.monthlyAttendance.month3 += 1;

}

}

else if(submission.internshipDuration === "6 Months"){

if(submission.monthlyAttendance.month1 < 20){

submission.monthlyAttendance.month1 += 1;

}
else if(submission.monthlyAttendance.month2 < 20){

submission.monthlyAttendance.month2 += 1;

}
else if(submission.monthlyAttendance.month3 < 20){

submission.monthlyAttendance.month3 += 1;

}
else if(submission.monthlyAttendance.month4 < 20){

submission.monthlyAttendance.month4 += 1;

}
else if(submission.monthlyAttendance.month5 < 20){

submission.monthlyAttendance.month5 += 1;

}
else{

submission.monthlyAttendance.month6 += 1;

}

}

submission.meetingsJoined += 1;



await submission.save();

res.json({
success:true,
message:"Attendance Submitted"
});

}catch(error){

console.log(error);

res.json({
success:false,
message:"Attendance Failed"
});

}

});

// ================= UPDATE NOTICE =================

app.post("/update-notice", async(req,res)=>{

try{

const {
domain,
morningMeeting,
eveningMeeting,
meetingLink,
importantNotice
} = req.body;

await Notice.findOneAndUpdate(

{ domain },

{
domain,
morningMeeting,
eveningMeeting,
meetingLink,
importantNotice
},

{
upsert:true,
new:true
}

);

res.json({
success:true
});

}catch(error){

console.log(error);

res.status(500).json({
success:false
});

}

});

// ================= ALL STUDENTS =================

app.get("/students", async(req,res)=>{

const adminPassword = req.headers.authorization;

if(adminPassword !== "Bearer mysecret123"){

return res.status(401).json({
message:"Unauthorized"
});

}

try{

const students =
await Student.find().sort({ createdAt:-1 });

res.json(students);

}catch(error){

res.status(500).json({
message:"Error fetching students"
});

}

});

// ================= UPDATE STUDENT =================

app.put("/students/:id", async(req,res)=>{

try{

await Student.findByIdAndUpdate(
req.params.id,
req.body,
{ new:true }
);

res.json({
message:"Student Updated"
});

}catch(error){

res.status(500).json({
message:"Update Failed"
});

}

});

// ================= DELETE STUDENT =================

app.delete("/students/:id", async(req,res)=>{

try{

await Student.findByIdAndDelete(req.params.id);

res.json({
message:"Student deleted"
});

}catch(error){

res.status(500).json({
message:"Error deleting student"
});

}

});

// ================= GET DOMAIN NOTICE =================

app.get("/get-notice/:domain", async(req,res)=>{

try{

const notice =
await Notice.findOne({

domain:req.params.domain

});

res.json(notice || {});

}catch(error){

console.log(error);

res.json({
success:false
});

}

});

// ================= STUDENT LOGIN =================

app.post("/student-login", async (req,res)=>{

try{

const { employeeId,password } = req.body;

const student =
await Student.findOne({
employeeId,
password
});

if(!student){

return res.json({
success:false,
message:"Invalid Employee ID or Password"
});

}

res.json({
 success:true,
 student:{
   name: student.firstName + " " + student.lastName,
   employeeId: student.employeeId,
   domain: student.domain
 }
})

}catch(error){

console.log(error);

res.json({
success:false,
message:"Server Error"
});

}

});

// ================= COORDINATOR LOGIN =================

app.post("/coordinator-login", async(req,res)=>{

try{

const { username,password } = req.body;

const coordinators = {

"devops_admin":{
password:"DevOps@2026",
domain:["DevOps","AWS Cloud"]
},

"cloud_admin":{
password:"Cloud@2026",
domain:"Cloud Computing"
},

"python_admin":{
password:"Python@2026",
domain:"Python Development"
},

"java_admin":{
password:"Java@2026",
domain:"Java Development"
},

"web_admin":{
password:"Web@2026",
domain:"Web Development"
},

"mern_admin":{
password:"Mern@2026",
domain:"MERN Stack Development"
},

"ai_admin":{
password:"AI@2026",
domain:"Artificial Intelligence"
},

"datascience_admin":{
password:"DS@2026",
domain:"Data Science"
},

"cyber_admin":{
password:"Cyber@2026",
domain:"Cyber Security"
},

"software_admin":{
password:"Software@2026",
domain:"Software Engineering"
},

"flutter_admin":{
password:"Flutter@2026",
domain:"Flutter Development"
}

};

const coordinator =
coordinators[username];

if(
!coordinator ||
coordinator.password !== password
){

return res.json({
success:false
});

}

res.json({

success:true,

coordinator:{
username,
domain:coordinator.domain
}

});

}catch(error){

console.log(error);

res.json({
success:false
});

}

});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
console.log(`Server running on port ${PORT}`);
});
