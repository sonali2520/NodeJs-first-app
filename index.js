// // const http=require("http");
// import http from "http";
// import fs from "fs"

// // const fName=require("./feature")
// import fName from "./feature.js";

// import { lovemeasure } from "./feature.js";
// // console.log(http);
// console.log(fName);

// const home=fs.readFileSync("./index.html");

// const server=http.createServer((req,res)=>{
//     if(req.url==="/"){
//         // fs.readFile("./index.html",(err,home)=>{
//         //     res.end(home)
//         // })
//         res.end(home)
//     }
//     else if(req.url==="/about"){
//         res.end(`<h1>Love is ${lovemeasure()}%</h1>`)
//     }
//     else if(req.url==="/contact"){
//         res.end("<h1>Contact</h1>")
//     }
//     else{
//         res.end("<h1>Page not Found</h1>")
//     }
// });
// // console.log(server);

// server.listen(4000,()=>{
//     console.log('server is working')
// })

import { name } from "ejs";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
const app=express();
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// app.get("/",(req,res)=>{
//     const filepath=path.resolve();
//     res.sendFile(path.join(filepath,"./index.html"));
// })
const users=[];

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database Connected"))
.catch((e)=>console.log(e));

const UserSchema= new mongoose.Schema({
    Name:String,
    Email:String,
    Password:String,
});

const User=mongoose.model("User",UserSchema);

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine","ejs");

const isAuthenticate=async(req,res,next)=>{
    const {token} = req.cookies;
    if(token){
        const decoded=jwt.verify(token,"asdfghuiknnjk");
        // console.log(decoded);
        req.user=await User.findById(decoded._id);
        next();
    }
    else{
        res.render("login");
    }
}

app.get("/",isAuthenticate,(req,res,next)=>{
    res.render("logout",{Name:req.user.Name});
})

app.get("/register",(req,res,next)=>{
    res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",async (req,res)=>{
    const {Email,Password}=req.body;
    let user=await User.findOne({Email});
    if(!user){
        return res.redirect("register");
    }
    const isMatch=bcrypt.compare(Password,user.Password);
    if(!isMatch)return res.render("login",{message:"Incorrect password"});
    const token=jwt.sign({_id:user._id},"asdfghuiknnjk");
     console.log(token);
     res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
     });
     res.redirect("/");
})

app.post("/register",async (req,res)=>{
    // console.log(req.body);
     const {Name,Email,Password}=req.body;
     let user=await User.findOne({Email});
     if(user){
        return res.redirect("/login");
     }
     const hashedPass=await bcrypt.hash(Password,10);
     user=await User.create({
        Name,
        Email,
        Password:hashedPass,
     });
     const token=jwt.sign({_id:user._id},"asdfghuiknnjk");
     console.log(token);
     res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
     });
     res.redirect("/");
})

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
       httpOnly:true,
       expires:new Date(Date.now()),
    });
    res.redirect("/");
})

// app.get("/",(req,res)=>{
//    res.render("index.ejs");
// //    res.render("index");
// })

// app.get("/add",(req,res)=>{
//     Messge.create({name: "Abhi",email:"abc@gmail.com"}).then(()=>{
//         res.send("Nice");
//     })
//  })

// app.get("/success",(req,res)=>{
//     res.render("success");
//  })

// app.post("/",async(req,res)=>{
//     const messageData={name:req.body.Name, email:req.body.Email};
//     await Messge.create(messageData);
//     res.redirect("/success");
// })

// app.post("/",async(req,res)=>{
//     const {name,email}=req.body;
//     await Messge.create({name,email});
//     res.redirect("/success");
// })

// app.get("/users",(req,res)=>{
//     res.json({users,});
// })

app.listen(5000,()=>{
    console.log("Server is Working");
});