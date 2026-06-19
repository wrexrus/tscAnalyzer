import mongoose from 'mongoose';
import dotenv from 'dotenv'; // 
dotenv.config();  //  do this or import 'dotenv/config'; 

console.log("MONGO_CONN:", process.env.MONGO_CONN);

const mongo_url = process.env.MONGO_CONN;

if (!mongo_url) {
    console.error("MONGO_CONN is not defined in the .env file.");
    process.exit(1); // Exit the process if the connection string is missing
}

mongoose.connect(mongo_url)
.then(()=>{
    console.log("MongoDB Connected...!");
}).catch((err)=>{
    console.error("MongoDB Connection error:", err.message);
    console.warn("⚠️ Please check your MONGO_CONN string in .env and ensure your IP is whitelisted on MongoDB Atlas.");
})