const express=require('express');
const router=express.Router();
const User=require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser');
const JWT_SECRET="Mayukhisagoodboy";

//Route 1: Create a User using: Post "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name','Enter a valid name').isLength({min:3}),
    body('password', 'Password must be atleast 5 characters').isLength({min:5}),
    body('email', 'Enter a valid email').isEmail(),
], async (req, res)=>{
    let success =false;
    //If there are errors, return Bad request and the errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()});
    }
    try{
    //Check whether the user with this email exists already
    let user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success, error:"Sorry a use with this email already exist"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    user=await User.create({
        name:req.body.name,
        password:secPass,
        email:req.body.email
    })

    const data={
        user:{
            id:user.id,
        }
    }
    const authtoken=jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authtoken, senderId: user.id});
    
}catch(error){
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//Route2: Authenticate a User using: Post "/api/auth/login". No login required
router.post('/login', [
    // body('password').isLength({min:5}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res)=>{
    let success = false;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }

const {email, password}=req.body;
try{
    let user=await User.findOne({email});
    if(!user){
        success=false;
        return res.status(400).json({error:"Please try to login with correct credentials"});
    }
        const passCompare=await bcrypt.compare(password, user.password);
        if(!passCompare){
            success=false;
            return res.status(400).json({success, error:"Please try to login with correct credentials"});
            
        }

        const data={
            user:{
                id:user.id,
            }
        }

        const authtoken=jwt.sign(data, JWT_SECRET);
        success=true;
        console.log("User ID:", user.id);
        res.json({success, authtoken, senderId: user.id});
    
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//Route 3: Get loggedin User Details using: Post "/api/auth/getuser". No login required
router.post('/getuser',fetchuser, async (req, res)=>{
try{
    
    userId=req.user.id;
    const user=await User.findById(userId).select("-password");
    res.send(user);
}
    catch(error){
    console.error(error.message);
        res.status(500).send("Internal server error");
}
})


module.exports=router