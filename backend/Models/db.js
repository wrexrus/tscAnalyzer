import mongoose from 'mongoose';
import dotenv from 'dotenv'; // 
dotenv.config();  //  do this or import 'dotenv/config'; 

const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url)
.then(()=>{
    console.log("MongoDB Connected...!");
}).catch((err)=>{
    console.log("MongoDB Connection error",err);    
})